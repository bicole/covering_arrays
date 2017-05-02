// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var LocalAPIKeyStrategy = require('passport-localapikey-update').Strategy;

// load up the user model
var bcrypt = require('bcrypt-nodejs');
var hatRack = require('hat').rack();
var databaseConnector = require('../app/databaseConnector.js');

/*// moved to databseConnector.js
////////////////////////////////trying to handle mysql server disconnects////////////////////
function handleDisconnect() {
    connection = mysql.createConnection(dbconfig.connection); // Recreate the connection, since
                                                  // the old one cannot be reused.

    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            //try to server a 503 like error
          
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect, to avoid a hot loop, and to allow our node script to process asynchronous requests in the meantime. If you're also serving http, display a 503 error.
        }
        connection.query('USE ' + dbconfig.database);                                      
    });                                    
                                          
    connection.on('error', function(err) {
        //console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();
///////////////////////////////end trying to handle mysql server disconnencts//////////////
*/

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        var connection = databaseConnector.createConnection();
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            connection.end();
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            var connection = databaseConnector.createConnection();
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err && connection) connection.end();
                if (err)                    
                    //return done(err);
                    return done(null, false, req.flash('signupMessage', 'Server maintance ongoing, check back later.'));                
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null),  // use the generateHash function in our user model
                        apiKey: hatRack()
                    };

                    var insertQuery = "INSERT INTO users ( username, password, apiKey ) values (?,?,?)";
                    var connection = databaseConnector.createConnection();
                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password, newUserMysql.apiKey], function(err, rows) {
                        connection.end();
                        newUserMysql.id = rows.insertId;                        
                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            console.log("username: " + username);
            var connection = databaseConnector.createConnection();
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                connection.end();
                if (err){
                    //return done(err);
                    return done(null, false, req.flash('loginMessage', 'Server maintance ongoing, check back later.'));
                }
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );

    // =========================================================================
    // API LOGIN ===============================================================
    // =========================================================================
    passport.use(new LocalAPIKeyStrategy({
            apiKeyField : 'apiKey'
        },
        function(apikey, done) {
            var connection = databaseConnector.createConnection();
            //User.findOne({ apikey: apikey }, function (err, user) {
            connection.query("SELECT * FROM users WHERE apiKey = ?",[apikey], function(err, rows){
                connection.end();
                if (err) { 
                    return done(err); 
                }
                if (!rows) {
                    return done(null, false); 
                }
                //no error, continue                
                return done(null, rows[0]);
            });
        }
    ));

};
