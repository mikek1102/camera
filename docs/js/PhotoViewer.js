// **DO THIS**:
//   Replace BUCKET_NAME with the bucket name.
//
var albumBucketName = 'mk-oh-snap-2';

// **DO THIS**:
//   Replace this block of code with the sample code located at:
//   Cognito -- Manage Identity Pools -- [identity_pool_name] -- Sample Code -- JavaScript
//
// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:f4bfb736-37fc-46f1-b659-65b2deb713f4',
});

// Create a new service object
var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName}
});

// A utility function to create HTML.
function getHtml(template) {
  return template.join('\n');
}

function viewSinglePhoto(photoUrl) {
  // Create the modal element
  var modal = document.createElement('div');
  modal.classList.add('modal');

  // Create the modal content element and add the full size image to it
  var modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');
  var img = document.createElement('img');
  img.src = photoUrl;
  modalContent.appendChild(img);

  // Add the modal content to the modal element
  modal.appendChild(modalContent);

  // Add the modal to the page
  document.body.appendChild(modal);

  // Add a click event listener to the modal to close it when clicked
  modal.addEventListener('click', function(event) {
  // Check if the modal or any of its children were clicked
  if (event.target === modal || modal.contains(event.target)) {
    modal.remove();
  }
});

}


// Show the photos that exist in an album.
function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent('mk-oh-snap-2') + '/';
  s3.listObjects({Prefix: albumPhotosKey}, function(err, data) {
    if (err) {
      return alert('There was an error viewing your album: ' + err.message);
    }
    // 'this' references the AWS.Request instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + '/';

    // Sort the data.Contents array by the LastModified property
    data.Contents.sort(function(a, b) {
      return b.LastModified - a.LastModified;
    });
    

    // Map the sorted data.Contents array to create the photos array
    var photos = data.Contents.map(function(photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        '<div class="thumbnail-wrapper">',
            '<br/>',
            '<img src="' + photoUrl + '" style="display: inline-block;" onclick="viewSinglePhoto(\'' + photoUrl + '\');"/>',
        '</div>',
      ]);
    });



    var htmlTemplate = [
      '<div id="thumbnails">',
        getHtml(photos),
      '</div>',
    ]
    document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
  });
}

