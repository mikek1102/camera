var bucketName = "mk-oh-snap-2";
var bucketRegion = "us-east-1";
var IdentityPoolId = "us-east-1:f4bfb736-37fc-46f1-b659-65b2deb713f4";

AWS.config.update({
               region: bucketRegion,
               credentials: new AWS.CognitoIdentityCredentials({
               IdentityPoolId: IdentityPoolId
               })
           });

           var s3 = new AWS.S3({
               apiVersion: '2006-03-01',
               params: {Bucket: bucketName}
       });

 //**** s3upload(); function without resizing *****     

       function s3uploadOriginal() { 
            
           var files = document.getElementById('camera').files;
           if (files) 
           {
               var file = files[0];
               var fileName = Math.floor(Math.random() * 10000000) + file.name;
               var filePath = 'original/' + fileName;
               var fileUrl = 'https://' + 'us-east-1' + '.amazonaws.com/original/' +  filePath;
       
               s3.upload({
                               Key: filePath,
                               Body: file,
                               ACL: 'public-read'
                           }, function(err, data) {
                               if(err) {
                                   reject('error');
                               }
                           }).on('httpUploadProgress', function (progress) {
                               var uploaded = parseInt((progress.loaded * 100) / progress.total);
                               $("progress").attr('value', uploaded);
                           });
           }
 };

/*  Handle multiple uploads as an async queue. Doesn't work yet.

const uploadQueue = [];

async function s3uploadOriginal() { 
    uploadQueue.push(true);
    while (uploadQueue.length > 0) {
        var files = document.getElementById('camera').files;
        if (files) {
            var file = files[0];
            var fileName = Math.floor(Math.random() * 10000000) + file.name;
            var filePath = 'original/' + fileName;
            var fileUrl = 'https://' + 'us-east-1' + '.amazonaws.com/original/' +  filePath;
            try {
                await s3.upload({
                    Key: filePath,
                    Body: file,
                    ACL: 'public-read'
                }).promise();
            } catch (err) {
                console.log(err);
            }
            uploadQueue.shift();
        }
    }
}; */