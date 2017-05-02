// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var http = require('http');
var app      = express();

const serverPort = 5000; //use port 5000 if no env var set

app.set('port', (process.env.PORT || serverPort));

var passport = require('passport');
var flash    = require('connect-flash');

// configuration ===============================================================
// connect to our database

require('./config/passport')(passport); // pass passport for configuration


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
	secret: 'keyboardmashsfdglhreothreotrekl', 
	resave: true,
	saveUninitialized: true,
    maxAge: 360*5
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//server static content
app.use("/resources", express.static(__dirname + '/resources'));

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
var server = http.createServer(app);
server.listen(app.get('port'));

console.log("http            listening on port " + app.get('port'));






///////////////////////////socket io start///////////////////////
var io = require('socket.io').listen(server);
var api = require('./app/api.js');


io.on('connection', function(socket){
    console.log('a user connected');
    socket.emit('login');

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('authLogin', function(apiKey){
       passport.authenticate('localapikey', { session: false, failureRedirect: '/api/v1/unauthorized' });

        socket.apiKey = apiKey;
        console.log("added apikey to socket: " + socket.apiKey);
        //socket.username = lookupUsername();
        //console.log("user logged into socket.io " + socket.username);

        socket.emit('sucessAuthLogin', apiKey);
    });

    //this is for the search array page
    socket.on('lookUpArray', function(arrayId, rows, strength, columns, symbols, status, tags, callback){
        api.lookUpArray(arrayId, rows, strength, columns, symbols, status, tags, function(result) {
            console.log("result: %j", result); //%j will pretty print the json
            //socket.emit('arrayFound', result);
            callback(result);
        });                             
    });

    //this is for the dashboard and arrays page
    socket.on('lookUpArrayInfo', function(msg, callback){
       api.lookUpArrayInfo(msg, function(result){
            callback(result);
       });
    });

    socket.on('addArrayWithProperties', function(msg, callback){
        api.getUserNameFromApiKey(socket.apiKey, function(username){
            msg.apiKey = socket.apiKey;
            msg.owner = username;
            api.addArrayWithProperties(msg, function(result) {
                console.log("array created with id: " + result);
                callback(result);
            });
        });
    });

    socket.on('updateArrayProperties', function(msg, callback){
        api.updateArrayProperties(msg, function() {
            console.log("array updated");
            callback();
        });
    });

    socket.on('uploadArray', function(msg){
        //add the session info to the msg
        msg.apiKey = socket.apiKey;
        //first sign the request
        api.signRequest(msg, function(result, err) {
            console.log("result: " + result);
            if(result != null){ //if no error                
                //res.write(result);
                //res.end();

                //now tell the client to upload via the signedRequest
                result.arrayId = msg.arrayId;
                socket.emit('signedRequestReady', result);                
            }else{ //if error
               console.log({"error": "error signing request"});
               socket.emit('errorSigningRequest', err);
            }
        });                     
    });

    socket.on('uploadResult', function(msg, callback){
        api.updateArrayWithProperties(msg, function(result) {
            console.log("updated array id: " + result);
            //socket.emit('created', result);
            callback();
        });
    });

    socket.on('getUsersArrays', function(msg, callback){
       api.getUserNameFromApiKey(msg, function(username){
           api.getUsersArrays(username, function(arrays){
               callback(arrays);
           });
       });
    });

    socket.on('lookUpUserInfo', function(msg, callback){
       api.lookUpUserInfo(msg, function(userInfo){
           callback(userInfo);
       })
    });

    socket.on('updateUserInfo', function(msg, callback){
        api.updateUserInfo(msg, function(){
            callback();
        })
    });

    socket.on('getUsernameFromApiKey', function(msg, callback){
        api.getUserNameFromApiKey(msg, function(username){
            callback(username);
        });
    });
});

//////////////////////////////////socket io end///////////////////////////

