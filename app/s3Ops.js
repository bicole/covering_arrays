var aws = require('aws-sdk');

//const S3_BUCKET = process.env.S3_BUCKET;
const S3_BUCKET = "";
const accessKeyId = '';
const secretAccessKey = '';
const maxFileSizeInBytes = 500000000; //this is 500mb

function signRequest(msg, callback) {
    //const s3 = new aws.S3({accessKeyId: '5EF2F4A9CF91DB61E7017215C177D864', secretAccessKey: 'd73a91081dda7ad508839b32b5cb70e42449e32e', endpoint: 'http://rest.s3for.me'})
    const s3 = new aws.S3({accessKeyId: accessKeyId, secretAccessKey: secretAccessKey})
    const username = msg.username;
    const apiKey = msg.apiKey;
    const fileName = msg.filename;
    const fileKey = username + '/' + apiKey + '/' + fileName;
    const fileType = msg.filetype;
    const fileSize = msg.size;
    const s3Params = {
        Bucket: S3_BUCKET,
        //Key: fileName,
        Key: fileKey,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };

    if(fileSize <= maxFileSizeInBytes){
        s3.getSignedUrl('putObject', s3Params, (err, data) => {
            if(err){
                console.error("error in putObject: " + err);
                callback(null);
            }
            const returnData = {
                signedRequest: data,
                url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileKey}`
            };
            //console.log(JSON.stringify(returnData));
            returnData.arrayId = msg.arrayId;
            callback(JSON.stringify(returnData));
        });
    }else{
        console.error("user trying to upload file that exceeds the maxFileSizeInBytes. File size is:", fileSize);
        callback(null, "exceeded file size limit of: " + maxFileSizeInBytes + "bytes the file you tried to upload is: " + fileSize + "bytes");
    }


}

function baseName(str)
{
    var base = new String(str).substring(str.lastIndexOf('/') + 1);
    //if(base.lastIndexOf(".") != -1)
        //base = base.substring(0, base.lastIndexOf(".")); //commented since we actually want the filename
    return base;
}


module.exports = {
    signRequest: function (msg, callback){
        signRequest(msg, callback);
        //var response = signRequest(msg, callback);    
        //return response;
    },
    baseName: function (str){
        return baseName(str);
    }
}
