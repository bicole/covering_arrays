var request = require('request');

var databaseQueries = require('./databaseConnector.js');
var s3Ops = require('./s3Ops.js');

//internal api functions
function parseArrayLookupString(key, queryValue){
    if(queryValue != ''){
        if(queryValue.match("^([>,<][0-9]+)([,])*([>,<][0-9]+)*") != null){
            //first remove spaces
            queryValue = queryValue.replace(/\s+/g, '');

            //if the input is a greater than or less than ie '>9' or '>9,<20'
            var queryPairs = [];
            if(queryValue.match(",") == null){
                //the queryValue doesnt have a comma so it must just have one comparisonOperator and a number
                var comparsionOperator = queryValue.match("[>,<]")[0];
                var numberQuery = queryValue.split(comparsionOperator).pop();
                var newQuery = { "operator": comparsionOperator, "numberQuery": numberQuery};
                queryPairs.push(newQuery);
            }else{
                //the queryValue has a comma so there is more then one comparisonOperator and more then one number
                try{
                    for(var i = 0; i < queryValue.split(",").length; ++i){
                        var individualQuery = queryValue.split(",")[i];
                        var comparsionOperator = individualQuery.match("[>,<]").pop();
                        var numberQuery = individualQuery.split(comparsionOperator).pop();
                        var newQuery = { "operator": comparsionOperator, "numberQuery": numberQuery};
                        queryPairs.push(newQuery);
                    }
                }catch (TypeError){
                    return -1;
                }
            }

            //now extract all the queryPairs and assembly the query
            var query = "";
            var needAnd = false;
            for(var i = 0; i < queryPairs.length; ++i){
                var comparsionOperator = queryPairs[i].operator;
                var numberQuery = queryPairs[i].numberQuery;

                if(needAnd){
                    query = query + " AND ";
                }

                query = query + "`" + key + "` " + comparsionOperator + " " + databaseQueries.escape(numberQuery) + " ";
                needAnd = true;
            }
            return query;
        }else if(queryValue.match("[0-9]+") != null){
            //first remove spaces
            queryValue = queryValue.replace(/\s+/g, '');
            //queryValue is just a number
            return "`" + key + "`=" + databaseQueries.escape(queryValue) + " ";
        }else{
            return "`" + key + "` REGEXP " + databaseQueries.escape(queryValue) + " ";
        }
    }else{
        return null;
    }
}

//external api functions
module.exports = {
    //this is for the search array page
	lookUpArray: function (arrayId, rows, strength, columns, symbols, status, tags, callback) {
        var connection = databaseQueries.createConnection();
        if(connection == -1){
            return;
        }

        //check that atleast one parameter is not null
        console.log("arrayId", arrayId, "rows", rows)
        if(arrayId == '' && rows == '' && strength == '' && columns == '' && symbols == '' && status == '' && tags == ''){
            connection.end();
            callback([]);
            return;
        }

	    //build the query string
        var query = "";
        var doINeedAnAndStatement = false;

        var arrayIdResult = parseArrayLookupString("arrayId", arrayId);
        var rowsResult = parseArrayLookupString("rows", rows);
        var strengthResult = parseArrayLookupString("strength", strength);
        var columnsResult = parseArrayLookupString("columns", columns);
        var symbolsResult = parseArrayLookupString("symbols", symbols);
        var tagsResult = parseArrayLookupString("tags", tags);

        //var statusResult = parseArrayLookupString("status", status);
        if(status == ''){
            var statusResult = null;
        }else{
            var statusResult = "`status`=" + databaseQueries.escape(status) + " ";
        }

        if(arrayIdResult == -1 || rowsResult == -1 || strengthResult == -1 || columnsResult == -1 || symbolsResult == -1 || statusResult == -1 || tagsResult == -1){
            //happens when a query is malformed
            connection.end();
            callback([]);
            return;
        }

        if(arrayIdResult != null){
            if(doINeedAnAndStatement == true){
                query = query + " AND ";
            }
            query = query + arrayIdResult;
            doINeedAnAndStatement = true;
        }

        if(rowsResult != null){
            if(doINeedAnAndStatement == true){
                query = query + " AND ";
            }
            query = query + rowsResult;
            doINeedAnAndStatement = true;
        }

        if(strengthResult != null){
            if(doINeedAnAndStatement == true){
                query = query + " AND ";
            }
            query = query + strengthResult;
            doINeedAnAndStatement = true;
        }

        if(columnsResult != null){
            if(doINeedAnAndStatement == true){
                query = query + " AND ";
            }
            query = query + columnsResult;
            doINeedAnAndStatement = true;
        }

        if(symbolsResult != null){
            if(doINeedAnAndStatement == true){
                query = query + " AND ";
            }
            query = query + symbolsResult;
            doINeedAnAndStatement = true;
        }

        if(statusResult != null){
            if(doINeedAnAndStatement == true){
                query = query + " AND ";
            }
            query = query + statusResult;
            doINeedAnAndStatement = true;
        }

        if(tagsResult != null){
            if(doINeedAnAndStatement == true){
                query = query + " AND ";
            }
            query = query + tagsResult;
            doINeedAnAndStatement = true;
        }

        //`arrayId` REGEXP' + connection.escape(arrayId)
        console.log("query", query);

        connection.query('SELECT arrayId, rows, strength, columns, symbols, status, filename, filesize, downloadLink, owner, description, tags FROM arrayproperties WHERE ' + query + ' ;', function(err, rows, fields) {
            if (err){
                console.error('error fetching query: ' + err.stack);
                connection.end();
                return;
            }
            connection.end();
            callback(rows);
        });
	},

    //this is for the dashboard and arrays page
    lookUpArrayInfo: function(msg, callback) {
        var connection = databaseQueries.createConnection();
        if(connection == -1){
            return;
        }
        connection.query('SELECT arrayId, rows, strength, columns, symbols, status, filename, filesize, downloadLink, owner, description, tags FROM arrayproperties WHERE arrayId=' + connection.escape(msg) + ' ;', function (err, rows, fields) {
            if (err) {
                console.error('error fetching query: ' + err.stack);
                return;
            }
            connection.end();
            callback(rows[0]);
        });
    },

    lookUpUserInfo: function(msg, callback) {
        var connection = databaseQueries.createConnection();
        if(connection == -1){
            return;
        }
        connection.query('SELECT username, firstname, lastname, companyOrInstitution, email, description FROM users WHERE username=' + connection.escape(msg) + ' ;', function (err, rows, fields) {
            if (err) {
                console.error('error fetching query: ' + err.stack);
                return;
            }
            connection.end();
            callback(rows[0]);
        });
    },


	addArrayWithProperties: function (msg, callback) {
        //console.log("adding array");
        var connection = databaseQueries.createConnection();        
        if(connection == -1){
            return;
        }

        var insertQuery = "INSERT INTO arrayproperties ( rows, strength, columns, symbols, owner, description, tags ) values (?,?,?,?,?,?,?)";
        
        //console.log("adding array: ", msg.rows,  msg.strength,  msg.columns,  msg.symbols,  msg.apiKey,  msg.description);

        connection.query(insertQuery, [msg.rows, msg.strength, msg.columns, msg.symbols, msg.owner, msg.description, msg.tags], function(err, rows) {
            if (err){
                console.error('error fetching query: ' + err.stack);
                return;
            }
            connection.end();
            callback(rows.insertId);
        }); 
	},

    updateArrayProperties: function (msg, callback) {
        var connection = databaseQueries.createConnection();
        if(connection == -1){
            return;
        }

        var updateQuery = "UPDATE arrayproperties SET `rows`='" + msg.rows + "', `strength`='" + msg.strength + "', `columns`='" + msg.columns + "', `symbols`='" + msg.symbols + "', `description`='" + msg.description + "', `status`='" + msg.status + "', `tags`='" + msg.tags + "' WHERE `arrayId`='" + msg.arrayId + "'";

        //console.log("adding array: ", msg.rows,  msg.strength,  msg.columns,  msg.symbols,  msg.apiKey,  msg.description);

        connection.query(updateQuery, [msg.rows, msg.strength, msg.columns, msg.symbols, msg.owner, msg.description, msg.tags], function(err, rows) {
            if (err){
                console.error('error fetching query: ' + err.stack);
                return;
            }
            connection.end();
            callback();
        });
    },

    updateArrayWithProperties: function (msg, callback) {
	    //to a HEAD request to S3 to find the filesize, use S3Ops to find filename
        console.log("msg", msg);
       request(msg.url, {method: 'HEAD'}, function(err, res, body) {
                if(err){
                    console.error("error", err);
                }
                console.log("headers", JSON.stringify(res.headers));
                msg.filename = s3Ops.baseName(msg.url);
                msg.filesize = res.headers["content-length"];
                updateDatabase(msg);
            }
        );

        //database query
	    function updateDatabase(msg) {
	        console.log("updating array", msg.arrayId, msg.filesize, msg.url, msg.filename);
            var connection = databaseQueries.createConnection();
            if (connection == -1) {
                return;
            }

            var insertQuery = "UPDATE arrayproperties SET `filename`=" + connection.escape(msg.filename) + ", `filesize`=" + connection.escape(msg.filesize) + ", `downloadLink`=" + connection.escape(msg.url) + " WHERE `arrayId`=" + connection.escape(msg.arrayId) + ";";
            connection.query(insertQuery, function (err, rows) {
                if (err) {
                    console.error('error executing query: ' + err.stack);
                    return;
                }
                connection.end();
                callback(rows.insertId);
            });
        }
    },
/* opps look like this is the same as getUserNameFromApiKey()
    lookUpUserWithApiKey: function (msg, callback) {
        var connection = databaseQueries.createConnection();
        if(connection == -1){
            return;
        }
        connection.query('SELECT username FROM users WHERE apiKey=' + connection.escape(msg) + ' ;', function(err, rows, fields) {
            if (err){
                console.error('error fetching query: ' + err.stack);
                return;
            }
            connection.end();
            callback(rows[0].username);
        });
    },

*/
    getUserNameFromApiKey: function(msg, callback) {
        var connection = databaseQueries.createConnection();
        if(connection == -1){
            return;
        }
        connection.query('SELECT username FROM users WHERE apiKey=' + connection.escape(msg) + ' ;', function (err, rows, fields) {
            if (err) {
                console.error('error fetching query: ' + err.stack);
                return;
            }
            connection.end();
            callback(rows[0].username);
        });
    },

    signRequest: function (msg, callback) {
	    //lookup the username and then add the username to the request
        console.log(msg.apiKey);
        module.exports.getUserNameFromApiKey(msg.apiKey, function(result){
            console.log("username", result)
            msg.username = result;
            s3Ops.signRequest(msg, callback);
        });
    },

    getUsersArrays: function(msg, callback){
        var connection = databaseQueries.createConnection();
        if(connection == -1){
            return;
        }
        connection.query('SELECT * FROM arrayproperties WHERE owner=' + connection.escape(msg) + ' ;', function(err, rows, fields) {
            if (err){
                console.error('error fetching query: ' + err.stack);
                return;
            }
            connection.end();
            callback(rows);
        });
    },

    updateUserInfo: function(msg, callback){
        var connection = databaseQueries.createConnection();
        if (connection == -1) {
            return;
        }

        var insertQuery = "UPDATE users SET `firstname`=" + connection.escape(msg.firstname) + ", `lastname`=" + connection.escape(msg.lastname) + ", `companyOrInstitution`=" + connection.escape(msg.affiliation) + ", `email`=" + connection.escape(msg.email) + ", `description`=" + connection.escape(msg.description) + " WHERE `username`=" + connection.escape(msg.username) + ";";
        connection.query(insertQuery, function (err, rows) {
            if (err) {
                console.error('error executing query: ' + err.stack);
                return;
            }
            connection.end();
            callback();
        });

    }
}
