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
        
        function s3upload() {  
            var files = document.getElementsByClassName("fileUploadButton").files;
            if (files) 
            {
                var file = files[0];
                var fileName = file.name;
                var filePath = 'mk-oh-snap-2/' + fileName;
                var fileUrl = 'https://' + 'us-east-1' + '.amazonaws.com/mk-oh-snap-2/' +  filePath;
        
                s3.upload({
                                Key: filePath,
                                Body: file,
                                ACL: 'public-read'
                            }, function(err, data) {
                                if(err) {
                                    reject('error');
                                }
                                
                                alert('Successfully Uploaded!');
                            }).on('httpUploadProgress', function (progress) {
                                var uploaded = parseInt((progress.loaded * 100) / progress.total);
                                $("progress").attr('value', uploaded);
                            });
            }
  };