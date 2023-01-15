 
var ohsnap = (function() {
	
	var maxFilesize = 1048576 * 5.5; // Max image size is 5.5MB (iPhone5, Galaxy SIII, Lumia920 < 3MB)
	var numPhotosSaved = 0;
	var imgCrop;
	var finalPhotoDimension = 612;
	var viewWidth;
	var isBlobSupported = true;
	
	// UI
	var loader = document.getElementById('loader'),
		firstRun = document.getElementById('firstrun'),		
		originalPhoto = document.getElementById('originalPhoto'),
		resultPhoto = document.getElementById('resultPhoto'),
		sectionMain = document.getElementById('main'),
		sectionPhotoEffect = document.getElementById('photoEffect'),
		sectionFilterDrawer = document.getElementById('filterDrawer'),
		sectionSingleView = document.getElementById('singleView'); 
	
	return {
		init: init
	};
	
	function init() {
		var prefetchImg = new Image();
		prefetchImg.src = 'images/effects-thumbs.png';
		var prefetchImg2 = new Image();
		prefetchImg2.src = 'images/effects/bokeh-stars.png';
		
		viewWidth = (window.innerWidth < finalPhotoDimension) ? window.innerWidth : finalPhotoDimension;
		
		bindEvents();		
		checkMediaCaptureSupport();
		console.log(navigator.userAgent);
	}
	
	function showUI(uiElem) {
		uiElem.removeAttribute('hidden');
	}
	
	function hideUI(uiElem) {
		uiElem.setAttribute('hidden', 'hidden');
	}
	
	
	function reInit() {
		hideUI(firstRun);
		hideUI(sectionPhotoEffect);
		hideUI(sectionFilterDrawer);
		hideUI(sectionSingleView);
		
		showUI(sectionMain);
		
		var index = numPhotosSaved-1;
		var q = '[data-index="' + index + '"]';
		
		var oldClone = document.querySelector('.swiper-wrapper');
		oldClone.parentNode.removeChild(oldClone);
		cloneThumbNode();
	}
	
	// Note: IE10 Mobile and Maxthon return the window.FileReader as 'function' but fail to read image
	// I need to write another capability check besides this function
	function checkMediaCaptureSupport() {
		if(typeof window.FileReader === 'undefined') {
			showUI(document.getElementById('warningMediaCapture'));
			document.querySelector('.camera').classList.add('no-support'); //disable the button
		}
	}
	
	function checkHistorySupport() {
		if (typeof history.pushState === 'undefined') {
			showUI(document.getElementById('warningHistory'));
		}
	}
	
    function renderFirstRun() {
	    showUI(firstRun);
	    var arrowHeight = window.innerHeight * .5;
		document.getElementsByClassName('arrow-container')[0].style.height = arrowHeight + 'px';
    }
       
	function bindEvents() {
		// Screen orientation/size change
		var orientationEvent = ('onorientationchange' in window) ? 'orientationchange' : 'resize';
		window.addEventListener(orientationEvent, function() {
		    displayThumbnails();
		}, false);

		// A photo taken (or a file chosen)
		document.getElementById('camera').addEventListener('change', function() {
			showUI(loader);
			fileSelected('camera');
		}, false);
		
		// Warning Icons
		document.getElementById('warnings').addEventListener('click', function(e) {console.log(e.target);
			if(e.target.classList.contains('icon-warning')) {
				e.target.classList.toggle('full');
			} else if(e.target.parentNode.classList.contains('icon-warning')) {
				e.target.parentNode.classList.toggle('full');
			}
			
		}, false);
		
		// View a photo in carousel
		document.getElementById('thumbnails').addEventListener('click', viewSinglePhoto, false);
		
		// Pop back to Main
		window.addEventListener('popstate', function(e){
			console.log(history.state);
			//if (history.state == undefined || history.state.stage == 'main') {
				showUI(sectionMain);
				hideUI(sectionSingleView);
				hideUI(sectionPhotoEffect);
				hideUI(sectionFilterDrawer);
				
				history.replaceState({stage: 'main'}, null);
			//}
		}, false);
		
		// popstate alternative
		document.getElementById('dismissSingleView').addEventListener('click', function(e){
			e.preventDefault();
			if (typeof history.pushState === 'function')	{
				history.go(-1); // pop one state manially
			}
			showUI(sectionMain);
			hideUI(sectionSingleView);
		}, false);
      	
	}

    function prepFilterEffect(e) {
    	var filterButton = getFilterButton(e.target);
		if(!filterButton) return;
		
    	showUI(loader);
		
		// Removing the previously created canvas
		var prevFilteredPhoto = document.getElementById('filteredPhoto');
		if(prevFilteredPhoto) {	
			prevFilteredPhoto.parentNode.removeChild(prevFilteredPhoto);
		}
			
		setTimeout(function(){
			ApplyEffects[filterButton.id](resultPhoto);
		}, 1);	
		
	    (function () {
	    	var newFilteredPhoto = document.getElementById('filteredPhoto');
			if(newFilteredPhoto) {
				console.log('canvas loaded!');
				newFilteredPhoto.style.width = newFilteredPhoto.style.height = viewWidth +'px';
				hideUI(loader);
			} else {
				console.log('canvas not loaded yet...');
				setTimeout(arguments.callee, 100);
			}
		})();
		
		function getFilterButton(target) {
			var button;
			if(target.classList.contains('filter')) {
				button = target;
			} else if (target.parentNode.classList.contains('filter')) {
				button = target.parentNode;
			}
			return button;
		}
    }
	
	function scrollInfinitely() {
		// TO DO
	}
	
	function cropAndResize() {
		var photoObj = document.getElementById('originalPhoto');

	    imgCrop = new PhotoCrop(photoObj, {
			size: {w: finalPhotoDimension, h: finalPhotoDimension}
	    });
	    
		var newImg = imgCrop.getDataURL();
		imgCrop.displayResult();
		hideUI(document.getElementById('croppedPhoto')); //keep in DOM but not shown
		
		resultPhoto.src = newImg;
		resultPhoto.style.width = resultPhoto.style.height = viewWidth +'px';
		
		// Removing the previously created canvas, if any
		var prevEffect = document.getElementById('filteredPhoto');
		if(prevEffect) {	
			prevEffect.parentNode.removeChild(prevEffect);
			showUI(resultPhoto);
		}
		
		hideUI(sectionMain);
		showUI(sectionPhotoEffect);
		hideUI(sectionFilterDrawer);
		hideUI(originalPhoto);
		
		history.pushState({stage: 'effectView'}, null);
	}
	
	/**
	 * File Picker
	 */

	function fileSelected(capture) {
		
	    var localFile = document.getElementById(capture).files[0],
	    	imgFormat = /^(image\/bmp|image\/gif|image\/jpeg|image\/png)$/i;
	    	
	    if (! imgFormat.test(localFile.type)) {
	        alert('The image format, ' + localFile.type + ' is not supported.');
			hideUI(loader);
	        return;
	    }
	    
	    if (localFile.size > maxFilesize) { //this should exclude a huge panorama pics
	        alert('The file size is too large.');
			hideUI(loader);
	        return;
	    }
	    
		// display the selected image
	    var orig = document.getElementById('originalPhoto');
	    var imgFile = new FileReader();
	    
		imgFile.onload = function(e){
	        // e.target.result contains the Base64 DataURL
	        orig.onload = function () {
	        	cropAndResize();	        
				//displayFileInfo(localFile, orig);
				hideUI(loader);
	        };
	        orig.src = e.target.result;
	    };
		
	    imgFile.readAsDataURL(localFile);
	}

	function uploadProgress(e) { 
		console.log(e);
		if (e.lengthComputable) {
			console.log(e.loaded / e.total * 100);
			loader.innerHTML = '<p style="margin-top:-20px">Uploading...</p><p style="margin-top:-175px;">' + ((e.loaded / e.total * 100) >>> 0) + '%</p>';
		} 
	}

	function uploadFinish(e) {		
		hideUI(loader);	
		loader.textContent = 'Processing...';
		reInit();
	}

	function uploadError(e) {
		alert('An error occurred while uploading the file.');
		hideUI(loader);	
		console.log(e);
	}
	
	function uploadAbort(e) {
		alert('The upload has been aborted by the user or the connection has been dropped.');
		hideUI(loader);	
		console.log(e);
	}
	
}());

onload = function() {
	ohsnap.init();
}

//reload button with spinner

document.getElementById("reload-button").addEventListener("click", function(){
    // show the spinner
    document.querySelector(".spinner").style.display = "block";
    location.reload();
});



  