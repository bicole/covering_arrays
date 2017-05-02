var socket = io(window.location.host, {secure: false});

/*
socket.on('login', function(response){
    //socket.emit('username',  window.userId, "<%= session %>");
    //console.log("logged into socket.io as: " + window.userId);
    console.log("inside login");
});
*/
socket.on('login', function(){
    socket.emit('authLogin',  window.apiKey, "<%= req.user.apiKey %>");
    //console.log("logged into socket.io as: " + window.apiKey);
});

socket.on('sucessAuthLogin', function(response){
    console.log("sucess logging in with apikey: " + response);
})

socket.on('errorSigningRequest', function(response){
    console.log("Failed to upload file: ", response);
    document.getElementById('arrayUploadFailed').innerText = response;
    document.getElementById('arrayUploadFailed').hidden = false;
})

socket.on('signedRequestReady', function(response){
    document.getElementById('arrayUploadFailed').hidden = true; //make sure the failure notice is hidden
    var responseJson = JSON.parse(response);
    console.log(responseJson); 
    console.log("signedUrl: " + responseJson.signedRequest);
    console.log("url: " + responseJson.url);   
    const xhr = new XMLHttpRequest();  
    xhr.open("PUT", responseJson.signedRequest, true);  
    //xhr.open("PUT", responseJson.url, true); 
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                document.getElementById('upload-url').value = responseJson.url; 
                console.log("upload complete.");
                console.log("responseJson", responseJson);
                socket.emit('uploadResult', responseJson, function(){
                    //redirect the user to the newly created array page
                    var targetArray = '/arrays?arrayId=' + responseJson.arrayId;
                    document.getElementById('arrayCreated').onclick = function(){window.location.href = targetArray };
                    document.getElementById('arrayCreated').hidden = false;
                    document.getElementById('file-input').value = "";
                });
            }
            else{
               console.log('Could not upload file: ' + xhr.responseText);
               console.log('xhr status: ' + xhr.status);
            }
        }
    };
    
    xhr.send(document.getElementById('file-input').files[0]);    
});

function clearFoundArrayTable(){
    var table =  document.getElementById('foundArrayTable');
    while(table.rows.length > 1){
        table.deleteRow(1);
    }
}

function populateFoundArrayTable(response){
    console.log("response", response);
    if(response.length > 0){
        document.getElementById('badArrayNumber').hidden = true;
        var tableRef = document.getElementById('foundArrayTable').getElementsByTagName('tbody')[0];

        for(var i = 0; i < response.length; ++i) {
            var foundArray = response[i];

            var newRow = tableRef.insertRow(tableRef.rows.length);

            var newArrayIdNumber = newRow.insertCell(0);
            var arrayIdNumber = document.createTextNode(foundArray.arrayId);
            newArrayIdNumber.appendChild(arrayIdNumber);

            var newNumRows = newRow.insertCell(1);
            var numRows = document.createTextNode(foundArray.rows);
            newNumRows.appendChild(numRows);

            var newNumStrength = newRow.insertCell(2);
            var numStrength = document.createTextNode(foundArray.strength);
            newNumStrength.appendChild(numStrength);

            var newNumColumns = newRow.insertCell(3);
            var numColumns = document.createTextNode(foundArray.columns);
            newNumColumns.appendChild(numColumns);

            var newNumSymbols = newRow.insertCell(4);
            var numSymbols = document.createTextNode(foundArray.symbols);
            newNumSymbols.appendChild(numSymbols);

            var newStatus = newRow.insertCell(5);
            var status = document.createTextNode(foundArray.status)
            newStatus.appendChild(status);

            var newTags = newRow.insertCell(6);
            var tags = document.createTextNode(foundArray.tags)
            newTags.appendChild(tags);

            var newViewButton = newRow.insertCell(7);
            var viewButton = document.createElement('button');
            var buttonText = document.createTextNode("View Array " + foundArray.arrayId);
            var buttonTarget = "location.href='/arrays?arrayId=" + foundArray.arrayId + "';"
            viewButton.setAttribute("onclick", buttonTarget);
            viewButton.appendChild(buttonText);
            newViewButton.appendChild(viewButton);
        }
    }else{
        document.getElementById('badArrayNumber').hidden = false;
    }
}

function populateArrayProperties(response, user){
    if(response != null){
        document.getElementById('badArrayNumber').hidden = true;
        var tableRef = document.getElementById('arrayPropertiesTable').getElementsByTagName('tbody')[0];

        //array id
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("Array Id");
        newRowCell.appendChild(numRows);

        var newArrayIdNumber  = newRow.insertCell(1);
        var arrayIdNumber  = document.createTextNode(response.arrayId);
        newArrayIdNumber.appendChild(arrayIdNumber);

        //rows
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("Rows");
        newRowCell.appendChild(numRows);

        var newArrayIdNumber  = newRow.insertCell(1);
        //var arrayIdNumber  = document.createTextNode(response.rows);
        var arrayIdNumber = document.createElement('input');
        arrayIdNumber.id = "rowsNumber";
        arrayIdNumber.type = "text";
        arrayIdNumber.readOnly = true;
        arrayIdNumber.value = response.rows;
        newArrayIdNumber.appendChild(arrayIdNumber);

        //strength
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("Strength");
        newRowCell.appendChild(numRows);

        var newArrayIdNumber  = newRow.insertCell(1);
        //var arrayIdNumber  = document.createTextNode(response.strength);
        var arrayIdNumber = document.createElement('input');
        arrayIdNumber.id = "strengthNumber";
        arrayIdNumber.type = "text";
        arrayIdNumber.readOnly = true;
        arrayIdNumber.value = response.strength;
        newArrayIdNumber.appendChild(arrayIdNumber);

        //columns
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("Columns");
        newRowCell.appendChild(numRows);

        var newArrayIdNumber  = newRow.insertCell(1);
        //var arrayIdNumber  = document.createTextNode(response.columns);
        var arrayIdNumber = document.createElement('input');
        arrayIdNumber.id = "columnsNumber";
        arrayIdNumber.type = "text";
        arrayIdNumber.readOnly = true;
        arrayIdNumber.value = response.columns;
        newArrayIdNumber.appendChild(arrayIdNumber);

        //symbols
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("Symbols");
        newRowCell.appendChild(numRows);

        var newArrayIdNumber  = newRow.insertCell(1);
        //var arrayIdNumber  = document.createTextNode(response.symbols);
        var arrayIdNumber = document.createElement('input');
        arrayIdNumber.id = "symbolsNumber";
        arrayIdNumber.type = "text";
        arrayIdNumber.readOnly = true;
        arrayIdNumber.value = response.symbols;
        newArrayIdNumber.appendChild(arrayIdNumber);

        //status
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("Status");
        newRowCell.appendChild(numRows);

        var newArrayIdNumber  = newRow.insertCell(1);
        //var arrayIdNumber  = document.createTextNode(response.status);
        var arrayIdNumber = document.createElement('select');
        arrayIdNumber.class = "custom-select";
        arrayIdNumber.id = "status";
        arrayIdNumber.type = "text";
        arrayIdNumber.readOnly = true;
        arrayIdNumber.disabled = true;
        arrayIdNumber.value = response.status;
        newArrayIdNumber.appendChild(arrayIdNumber);
        var optionsArray = ["not verified", "verified", "superseded"];
        for(var index = 0; index < optionsArray.length; ++index){
            var option = document.createElement("option");
            option.value = optionsArray[index];
            option.text = optionsArray[index];
            arrayIdNumber.appendChild(option);
        }
        arrayIdNumber.value = response.status;

        //tags
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("Tags");
        newRowCell.appendChild(numRows);

        var newArrayIdNumber  = newRow.insertCell(1);
        //var arrayIdNumber  = document.createTextNode(response.tags);
        var arrayIdNumber = document.createElement('input');
        arrayIdNumber.id = "tags";
        arrayIdNumber.type = "text";
        arrayIdNumber.readOnly = true;
        arrayIdNumber.value = response.tags;
        newArrayIdNumber.appendChild(arrayIdNumber);

        //uploader
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("Uploader");
        newRowCell.appendChild(numRows);

        var newArrayUploader  = newRow.insertCell(1);
        var arrayUploader  = document.createElement('a');
        var arrayUploaderText  = document.createTextNode(user.username);
        arrayUploader.appendChild(arrayUploaderText);
        arrayUploader.title = user.username;
        arrayUploader.href = "/users?userName=" + user.username;
        newArrayUploader.appendChild(arrayUploader);
    }else{
        document.getElementById('badArrayNumber').hidden = false;
    }
}

function populateArrayDownloadTable(response){
    if(response != null){
        console.log("response", response);

        if(response.filename == null){
            return;
        }

        document.getElementById('badArrayNumber').hidden = true;
        var tableRef = document.getElementById('arrayDownloadTable').getElementsByTagName('tbody')[0];

        var newRow   = tableRef.insertRow(tableRef.rows.length);

        //filename
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode(response.filename);
        newRowCell.appendChild(numRows);

        //filesize
        var newFilesize  = newRow.insertCell(1);
        var arrayFilesize  = document.createTextNode(response.filesize);
        newFilesize.appendChild(arrayFilesize);

        //download link
        var newDownloadButton  = newRow.insertCell(2);
        var downloadButton  = document.createElement('button');
        var buttonText  = document.createTextNode("Download Array");
        var buttonTarget = "window.open('" + response.downloadLink + "')"
        downloadButton.setAttribute("onclick", buttonTarget);
        downloadButton.appendChild(buttonText);
        newDownloadButton.appendChild(downloadButton);

    }else{
        document.getElementById('badArrayNumber').hidden = false;
    }
}

function setupArrayEditButton(data, user){
    //a user will not have an api key if they are not logged in
    if(window.apiKey == undefined || window.apiKey == null || window.apiKey == "NOTLOGGEDIN$$%"){
        console.log("user is not logged in, apiKey", window.apiKey);
        document.getElementById('editAndSaveDiv').hidden = true;
        return;
    }
    socket.emit('getUsernameFromApiKey', window.apiKey, function(username){
        console.log("data.username", user.username, "apiResponseUsername", username);
        if(user.username == username){
            document.getElementById('editAndSaveDiv').hidden = false;
            document.getElementById('editAndSaveArrayButton').onclick = function(){
                document.getElementById('editAndSaveArrayButton').innerText = "Save Array";
                document.getElementById('rowsNumber').readOnly = false;
                document.getElementById('strengthNumber').readOnly = false;
                document.getElementById('columnsNumber').readOnly = false;
                document.getElementById('symbolsNumber').readOnly = false;
                document.getElementById('status').disabled = false;
                document.getElementById('tags').readOnly = false;
                document.getElementById('textDescription').disabled = false;

                document.getElementById('editAndSaveArrayButton').onclick = function(){
                    //update the db with the modified array
                    var updatedArray = {};
                    //updatedArray.arrayId = document.getElementById('arrayIdNumber').value;
                    updatedArray.arrayId = arrayIdFromQueryString;
                    updatedArray.rows = document.getElementById('rowsNumber').value;
                    updatedArray.strength = document.getElementById('strengthNumber').value;
                    updatedArray.columns = document.getElementById('columnsNumber').value;
                    updatedArray.symbols = document.getElementById('symbolsNumber').value;
                    updatedArray.status = document.getElementById('status').value;
                    updatedArray.tags = document.getElementById('tags').value;
                    updatedArray.description = document.getElementById('textDescription').value;

                    console.log("updatedArray", updatedArray);

                    socket.emit('updateArrayProperties', updatedArray, function(){
                        console.log("updated array");
                        document.getElementById('editAndSaveArrayButton').innerText = "Edit Array";
                    });
                }
            };
        }else{
            document.getElementById('editAndSaveDiv').hidden = true;
        }
    });
}

function populateArrayDescription(response){
    document.getElementById('textDescription').value = response.description;
}

//for the searchArrays page
function lookUpArray(pressEvent, arrayNumber, rows, strength, columns, symbols, status, tags){
    console.log("submitted array for lookup: " + arrayNumber);  
    pressEvent.preventDefault(pressEvent);
    pressEvent.returnValue = false;

    socket.emit('lookUpArray',  arrayNumber, rows, strength, columns, symbols, status, tags, function(data){
        clearFoundArrayTable();
        populateFoundArrayTable(data);
    });
    //document.getElementById('inputArrayNumber').value = "";
    return false;
}

//for the Arrays page
function lookUpArrayInfo(arrayNumber) {
    socket.emit('lookUpArrayInfo', arrayNumber, function(data){
        socket.emit('lookUpUserInfo', data.owner, function(user){
            console.log("userInfo", user);
            populateArrayProperties(data, user);
            populateArrayDownloadTable(data);
            populateArrayDescription(data);
            setupArrayEditButton(data, user);
        });
    });
}

function addArrayToDatabase(event, rows, strength, columns, symbols, description, tags){
    var array = {};
    array.rows = rows;
    array.strength = strength;
    array.columns = columns;
    array.symbols = symbols;
    array.description = description;
    array.tags = tags;

    console.log("adding array to database: ", array);

    event.preventDefault();
    //event.returnValue = false;
    //event.stopPropagation();
    socket.emit('addArrayWithProperties',  array, function(data){
        //clear the input boxes
        document.getElementById('inputNumRows').value = "";
        document.getElementById('inputStrength').value = "";
        document.getElementById('inputNumColumns').value = "";
        document.getElementById('inputNumSymbols').value = "";
        document.getElementById('inputTextDescription').value = "";
        document.getElementById('inputTags').value = "";

        //upload the file
        const files = document.getElementById('file-input').files;
        const file = files[0];
        if(file != null){
            file.arrayId = data;
            uploadfile(file);
        }else{
            //redirect to the new arrays page
            var targetArray = '/arrays?arrayId=' + data;
            document.getElementById('arrayCreated').onclick = function(){window.location.href = targetArray };
            document.getElementById('arrayCreated').hidden = false;
        }
    });
    return false;
}

function uploadfile(file){  
    console.log(file);
    console.log("submitted file for upload: " + file.name);
    var msg = {};
    msg.filename = file.name;
    msg.filetype = file.type;
    msg.arrayId = file.arrayId;
    msg.size = file.size;
    socket.emit('uploadArray',  msg);    
    //document.getElementById('inputArrayNumber').value = "";
    //return false;    
}

function getUsersArrays(apiKey){
    socket.emit('getUsersArrays', apiKey, function(arrays){
        console.log("arrays", arrays);
        var tableRef = document.getElementById('usersArraysTable').getElementsByTagName('tbody')[0];

        for(var i = 0; i < arrays.length; ++i){
            var array = arrays[i];
            //array id
            var newRow   = tableRef.insertRow(tableRef.rows.length);
            var newRowCell  = newRow.insertCell(0);
            var numRows  = document.createTextNode(array.arrayId);
            newRowCell.appendChild(numRows);

            //CA(t,v,k)
            var newRowCell  = newRow.insertCell(1);
            var numRows  = document.createTextNode("CA(" + array.strength + ", " + array.symbols + ", " + array.columns + ")");
            newRowCell.appendChild(numRows);

            //array page
            var newViewButton  = newRow.insertCell(2);
            var viewButton  = document.createElement('button');
            var buttonText  = document.createTextNode("View Array");
            var buttonTarget = "location.href='/arrays?arrayId=" + array.arrayId + "';"
            viewButton.setAttribute("onclick", buttonTarget);
            viewButton.appendChild(buttonText);
            newViewButton.appendChild(viewButton);
        }
    });
}

function lookUpUserInfo(username) {
    socket.emit('lookUpUserInfo', username, function(user){
        console.log("userInfo", user);
        populateUserInfo(user);
    });
}

function populateUserInfo(response){
    if(response != null){
        document.getElementById('badUser').hidden = true;
        var tableRef = document.getElementById('userPropertiesTable').getElementsByTagName('tbody')[0];

        //username
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("Username");
        newRowCell.appendChild(numRows);

        var newArrayIdNumber  = newRow.insertCell(1);
        var arrayIdNumber  = document.createTextNode(response.username);
        newArrayIdNumber.appendChild(arrayIdNumber);

        //first name
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("First name");
        newRowCell.appendChild(numRows);

        var newArrayIdNumber  = newRow.insertCell(1);
        var arrayIdNumber  = document.createTextNode(response.firstname);
        newArrayIdNumber.appendChild(arrayIdNumber);

        //last name
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("Last name");
        newRowCell.appendChild(numRows);

        var newArrayIdNumber  = newRow.insertCell(1);
        var arrayIdNumber  = document.createTextNode(response.lastname);
        newArrayIdNumber.appendChild(arrayIdNumber);

        //companyOrInstitution
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("Affiliation");
        newRowCell.appendChild(numRows);

        var newArrayIdNumber  = newRow.insertCell(1);
        var arrayIdNumber  = document.createTextNode(response.companyOrInstitution);
        newArrayIdNumber.appendChild(arrayIdNumber);

        //email
        var newRow   = tableRef.insertRow(tableRef.rows.length);
        var newRowCell  = newRow.insertCell(0);
        var numRows  = document.createTextNode("Email");
        newRowCell.appendChild(numRows);

        var newArrayIdNumber  = newRow.insertCell(1);
        var arrayIdNumber  = document.createTextNode(response.email);
        newArrayIdNumber.appendChild(arrayIdNumber);

        //text description
        var textDescription = response.description;
        if(response.description == null){
            textDescription = "No description found.";
        }
        document.getElementById('textDescription').value = textDescription;

    }else{
        document.getElementById('badUser').hidden = false;
    }
}

function loadUserInfo(username) {
    socket.emit('lookUpUserInfo', username, function(user){
        console.log("userInfo", user);
        populateUserAccountInfo(user);
    });
}

function populateUserAccountInfo(user){
    document.getElementById("firstName").value = user.firstname;
    document.getElementById("lastName").value = user.lastname;
    document.getElementById("affiliation").value = user.companyOrInstitution;
    document.getElementById("email").value = user.email;
    document.getElementById("textDescription").value = user.description;
}

function updateUserInfo(event, username, firstname, lastname, affiliation, email, description){
    var userInfo = {};
    userInfo.username = username;
    userInfo.firstname = firstname;
    userInfo.lastname = lastname;
    userInfo.affiliation = affiliation;
    userInfo.email = email;
    userInfo.description = description;

    event.preventDefault();

    socket.emit('updateUserInfo', userInfo, function(data){
        document.getElementById('userInfoUpdated').hidden = false;
    });
    return false;
}