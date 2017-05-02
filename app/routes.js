// app/routes.js
const url = require('url');
const querystring = require('querystring');
var api = require('./api.js');
//
module.exports = function(app, passport) {		 

	app.all('*', function(req, res, next) {
       //if you need to set a header for all routes like:  res.header('Access-Control-Allow-Credentials', 'true'); do it here
       next();
	});

    // =====================================
	// COVER PAGE (with login links) =======
	// =====================================
	app.get('/', function(req, res) {
		res.render('coverPage.ejs'); // load the index.ejs file
	});

    // =====================================
	// CONTACT PAGE ========================
	// =====================================
	// show the login form
	app.get('/contact', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('contact.ejs');
	});

    // =====================================
	// DASHBOARD SECTION ===================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/dashboard', isLoggedIn, function(req, res) {
		req.session.uid = req.user.username;
		res.render('dashboard.ejs', {
			req : req, // get the user out of session and pass to template
			session : req.session.uid
		});
	});



    // =====================================
	// SEARCH ARRAYS PAGE ==================
	// =====================================
	//user does not need to be logged in to use this page	
	app.get('/searchArrays', function(req, res) {		
		res.render('searchArrays.ejs');
	});

    // =====================================
    // ARRAYS PAGE ==================
    // =====================================
    //user does not need to be logged in to use this page
    app.get('/arrays?*', parseQueryString, function(req, res) {
        console.log("arrayId", req.parsedQueryString.arrayId);
        console.log('req.user', req.user);
        if(req.user != null){
        	//if req.user exists then they are logged in, pass along their credentials so they can possibly edit the array
            res.render('arrays.ejs', {
                req : req,
                queryString : req.parsedQueryString
            });
		}else{
        	//they are not logged in, so modify the req to reflect that
			var modifiedReq = req;
			modifiedReq.user = {};
			modifiedReq.user.username = "NOTLOGGEDIN$$%";
            modifiedReq.user.apiKey = "NOTLOGGEDIN$$%";
            res.render('arrays.ejs', {
                req : modifiedReq,
                queryString : req.parsedQueryString
            });
		}

    });

    // =====================================
    // Users PAGE ==================
    // =====================================
    //user does not need to be logged in to use this page
    app.get('/users?*', parseQueryString, function(req, res) {
        res.render('users.ejs', {
            queryString : req.parsedQueryString
        });
    });

    // =====================================
	// ADD ARRAY PAGE ==================
	// =====================================
	//user does not need to be logged in to use this page	
	app.get('/addArray', isLoggedIn, function(req, res) {
		res.render('addArray.ejs', {
            req : req, // get the user out of session and pass to template
            session : req.session.uid
        });
	});
	
	// =====================================
	//  LOGIN ==============================
	// =====================================
	app.get('/login', function(req, res) {	    
	    // render the page and pass in any flash data if it exists
	    if(req.session.uid){
	    	res.render('dashboard.ejs', {
				req : req, // get the user out of session and pass to template
				session : req.session.uid
			});
	    } else{
		    res.render('login.ejs', { message: req.flash('loginMessage') });
	    }
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/dashboard', // redirect to the secure dashboard section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
	    function(req, res) {
	            //console.log("hello");
	            if (req.body.remember) {
	              req.session.cookie.maxAge = 1000 * 60 * 3;
	            } else {
	              req.session.cookie.expires = false;
	            }
	        res.redirect('/');
	   	}
   	);

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/accountInst', // redirect to the secure account instantiat section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
        req.session.destroy();
        req.logout();
        res.redirect('/');
    });

    // =====================================
	// ACCOUNT PAGE ========================
	// =====================================	
	app.get('/account', isLoggedIn, function(req, res) {
		req.session.uid = req.user.username;
		res.render('account.ejs', {
			req : req, // get the user out of session and pass to template
			session : req.session.uid
		});
	});

	// =====================================
	// ACCOUNT INSTANTIATION  ==============
	// =====================================
	app.get('/accountInst', function(req, res){
		res.redirect('/dashboard'); // redirect to the secure dashboard section after successful call to newUser
	});


    // =====================================
	// sitemap  ============================
	// =====================================
	app.get('/sitemap', function(req, res) {
		var fs = require('fs');   
		fs.readFile('./resources/googleResources/sitemap.xml', function(err, data){
			if(err){
				console.error("error loading sitemap: " + err);
			}
			res.header('Content-Type', 'text/xml').send(data);
		})
	});

	// =====================================
	// robots.txt  ============================
	// =====================================
	app.get('/robots.txt', function(req, res) {
		var fs = require('fs');   
		fs.readFile('./resources/googleResources/robots.txt', function(err, data){
			if(err){
				console.error("error loading robots.txt: " + err);
			}
			res.header('Content-Type', 'text/plain').send(data);
		})
	});

    // =====================================
    // favicon.ico  ========================
    // =====================================
    app.get('/favicon.ico', function(req, res) {
        var fs = require('fs');
        fs.readFile('./resources/imgs/favicon.ico', function(err, data){
            if(err){
                console.error("error loading favicon.ico: " + err);
            }
            //res.header('Content-Type', 'text/plain').send(data);
            res.send(data);
        })
    });


	// =====================================
	// API functions =======================
	// =====================================
	//http://192.168.1.19:5000/api/v1/lookUpArray?apiKey=16fd6cc633b282284c7f7711b140176f&id=2
	app.get('/api/v1/lookUpArray?*', parseQueryString, validateApiKey(passport), function(req, res) {		
        api.lookUpArray(req.parsedQueryString.id, function(result) {
            console.log("result: %j", result); //%j will pretty print the json
            if(result != null){ //if we found an array with that id
            	res.send(result);
            }else{ //if we didnt find an array with that id, send a empty object
            	res.send({});
            }
        }); 
	});	

	//http://192.168.1.19:5000/api/v1/addArrayWithProperties?apiKey=16fd6cc633b282284c7f7711b140176f&rows=7&strength=6&columns=5&symbols=4
	app.get('/api/v1/addArrayWithProperties?*', parseQueryString, validateApiKey(passport), function(req, res) {		
        api.addArrayWithProperties(req.parsedQueryString, function(result) {
            console.log("result: %j", result); //%j will pretty print the json
            if(result != null){ //if we were able to add the array return the new arrayId
            	res.send({"newArrayId" : result});
            }else{ //if werent able to add the array
            	res.send({"error": "error adding array"});
            }
        }); 
	});

    //http://localhost:5000/api/v1/sign-s3?apiKey=16fd6cc633b282284c7f7711b140176f&filename=testfilenames3&filetype=png
	app.get('/api/v1/sign-s3', parseQueryString, validateApiKey(passport), function(req, res){
		api.signRequest(req.parsedQueryString, function(result){
			console.log(result);
            if(result != null){ //if no error
            	//res.send({"newArrayId" : result});
            	res.write(result);
            	res.end();
            }else{ //if error
            	res.send({"error": "error signing request"});
            }
		});
	});

	/*
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/dashboard', // redirect to the secure dashboard section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
	    function(req, res) {
	            //console.log("hello");
	            if (req.body.remember) {
	              req.session.cookie.maxAge = 1000 * 60 * 3;
	            } else {
	              req.session.cookie.expires = false;
	            }
	        res.redirect('/');
	   	}
   	);
	*/



	// =====================================
	// Error Api key invalid ===============
	// =====================================
	app.get('/api/v1/unauthorized', function(req, res){
		res.send({"error": "api key invalid"});
	});

	// ===================================== //THIS NEEDS TO BE THE LAST THING IN module.exports = function(app, passport) {
	// Error 404 =========================== //THIS WILL CATCH ANY GET THAT WE DONT HAVE A ROUTE FOR
	// =====================================
	app.get('*', function(req, res){
		res.render('404.ejs');
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()) {
        return next();
    }

	// if they aren't logged in redirect them to the home page
	console.error("###############user not logged in, redirecting to home");
	res.redirect('/login');
}
/*
function optionalIsLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }else{
    	//do nothing, this is an optional logged in
		res.notLoggedIn = true;
		res.user = {};

		res.user.username = "asdf";
		res.user.apiKey = "frdsa";
		return next();
	}
}
*/

function parseQueryString(req, res, next){
	var urlObject = url.parse(req.url); //look at https://nodejs.org/docs/latest/api/url.html#url_url_strings_and_url_objects to see what a URLObject looks like
	//console.log(urlObject.query);
	var parsedQueryString = querystring.parse(urlObject.query);
	req.parsedQueryString = parsedQueryString;

	//set properties for the req
	req.apiKey = parsedQueryString.apiKey; //add the apiKey to the req body so that passport can easily find it

	return next();
}

function validateApiKey(passport){	
	return passport.authenticate('localapikey', { session: false, failureRedirect: '/api/v1/unauthorized' });
	//passport.authenticate will automatically call next() so long as we pass auth, so no need to call it here
}


   	