'use strict';

var screenshotKey = false;
var screenshotFunctionality = 0;
var screenshotFormat = "png";
var extension = 'png';

var previewContainer = document.createElement("div");
previewContainer.className = "previewContainer";
previewContainer.style.display = "none";

var handle = document.createElement("div");
handle.id = "handle";
var dragging = false;
var offsetX, offsetY;

handle.addEventListener('mousedown', function(e) {
    dragging = true;
    offsetX = e.clientX - previewContainer.offsetLeft;
    offsetY = e.clientY - previewContainer.offsetTop;
});

document.addEventListener('mousemove', function(e) {
    if (dragging) {
		previewContainer.style.position = "relative";
        var newLeft = e.clientX - offsetX;
        var newTop = e.clientY - offsetY;

        // 限制左边界
        if (newLeft < 0) {
            newLeft = 0;
        }
        // 限制上边界
        if (newTop < 0) {
            newTop = 0;
        }
        // 限制右边界
        if (newLeft + previewContainer.offsetWidth > window.innerWidth) {
            newLeft = window.innerWidth - previewContainer.offsetWidth;
        }
        // 限制下边界
        if (newTop + previewContainer.offsetHeight > window.innerHeight) {
            newTop = window.innerHeight - previewContainer.offsetHeight;
        }

        previewContainer.style.left = newLeft + 'px';
        previewContainer.style.top = newTop + 'px';
    }
});

document.addEventListener('mouseup', function() {
    dragging = false;
});

var topContainer = document.createElement("div");
topContainer.style.display = " flex";
topContainer.style.justifyContent = "center";
topContainer.appendChild(handle);
previewContainer.appendChild(topContainer);

var previewImageContainer = document.createElement("div");
previewImageContainer.className = "previewImageContainer";

var downloadButton = document.createElement("button");
var copyButton = document.createElement("button");
copyButton.className = "mainButton";
copyButton.innerHTML = "Copy";
downloadButton.className = "mainButton";
downloadButton.innerHTML = "Download";
//关闭浮层按钮
var closeButton = document.createElement("button");
closeButton.innerHTML = "Close";
closeButton.className = "closeButton";
closeButton.onclick = function() {
	previewImageContainer.innerHTML = ""; // Clear preview images
	previewContainer.style.display = "none";
	n = 0;
	portion = 0.2;
	copyButton.innerHTML = "Copy";
	copyButton.style.backgroundColor = downloadButton.style.backgroundColor;
};

var buttonContainer = document.createElement("div");
buttonContainer.style.display = "flex";
buttonContainer.style.alignContent = "center";
buttonContainer.style.justifyContent = "flex-start";
copyButton.style.marginLeft = "10px";

buttonContainer.appendChild(downloadButton);
buttonContainer.appendChild(copyButton);

var bottomContainer = document.createElement("div");
bottomContainer.appendChild(buttonContainer);
bottomContainer.appendChild(closeButton);
bottomContainer.style.display = "flex";
bottomContainer.style.alignContent = "center";
bottomContainer.style.justifyContent = "space-between";
bottomContainer.style.marginTop = "10px";

function createCanvasFromImages() {
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	var totalHeight = 0;
	var maxWidth = 0;
	var offsetY = 0;

	//创建previewImage
	var previewImages = document.querySelectorAll(".previewImage");
	previewImages.forEach(function(image) {
			totalHeight += image.naturalHeight;
			maxWidth = Math.max(maxWidth, image.naturalWidth);
	});

	canvas.width = maxWidth;
	canvas.height = totalHeight;

	previewImages.forEach(function(image){
		// if(index === 0) {
			ctx.drawImage(image, 0, offsetY, image.naturalWidth, image.naturalHeight);
			offsetY += image.naturalHeight;
		// } else {
		// 	ctx.drawImage(image, 0, image.naturalHeight*0.5, image.naturalWidth, image.naturalHeight*0.5, 0, offsetY, image.naturalWidth, image.naturalHeight*0.5);
		// 	offsetY += image.naturalHeight*0.5;
		// }
	});
	return canvas;
}
downloadButton.onclick = function() {
	var canvas = createCanvasFromImages();
	var link = document.createElement("a");
	link.href = canvas.toDataURL("image/"+ extension);
	link.download = "merged_screenshot" + extension;
	link.click();
};

copyButton.onclick = function() {
	async function ClipboardBlob(blob) {
		const clipboardItemInput = new ClipboardItem({ "image/png": blob });
		await navigator.clipboard.write([clipboardItemInput]);
	}

	// Create canvas from images
	var canvas = createCanvasFromImages();
	// If lipboard copy is needed generate png (clipboard only supports png)
	canvas.toBlob(async function (blob) {
		await ClipboardBlob(blob);
	}, 'image/png');	
    copyButton.innerHTML = "Copied!";
	copyButton.style.backgroundColor = "grey";
};

// var shareButton = document.createElement("button");
// shareButton.className = "shareButton";
// shareButton.innerHTML = "Share";
// shareButton.onclick = function() {
// 	var previewImageSrc = canvas.toDataURL("image/png");
// 	// Add your code to share the image

// 	// Call the system's share menu interface
// 	navigator.share({
// 		title: "Share Screenshot",
// 		text: "Check out this screenshot!",
// 		url: previewImageSrc
// 	})
// 		.then(() => console.log('Image shared successfully.'))
// 		.catch((error) => console.error('Error sharing image:', error));
// };

previewContainer.appendChild(previewImageContainer);
previewContainer.appendChild(bottomContainer);
// previewContainer.appendChild(shareButton);
document.body.appendChild(previewContainer);

chrome.storage.sync.get(['screenshotKey', 'screenshotFunctionality', 'screenshotFileFormat'], function(result) {
	screenshotKey = result.screenshotKey;
	if (result.screenshotFileFormat === undefined) {
		screenshotFormat = 'png'
	} else {
		screenshotFormat = result.screenshotFileFormat
	}

	if (result.screenshotFunctionality === undefined) {
		screenshotFunctionality = 0;
	} else {
		screenshotFunctionality = result.screenshotFunctionality;
	}

	if (screenshotFormat === 'jpeg') {
		extension = 'jpg';
	} else {
		extension = screenshotFormat;
	}
});

document.addEventListener('keydown', function(e) {
	if (document.activeElement.contentEditable === 'true' || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.contentEditable === 'plaintext')
		return true;

	if (screenshotKey && e.key.toLowerCase() === 'p') {
		CaptureScreenshot();
		e.preventDefault();
		return false;
	}
});

var n = 0;
var portion = 0.2;
// var portionInput = document.createElement("input");
// portionInput.className = "portionInput";
// portionInput.type = "range";  // 创建一个滑块
// portionInput.min = "0";  // 设置滑块的最小值
// portionInput.max = "1";  // 设置滑块的最大值
// portionInput.step = "0.01";  // 设置滑块的步长
// portionInput.value = portion;  // 设置滑块的初始值
// portionInput.addEventListener("input", function() {
// 	portion = this.value;
// });


function CaptureScreenshot() {
	var appendixTitle = "screenshot." + extension;

	var title;

	var headerEls = document.querySelectorAll("h1.title.ytd-video-primary-info-renderer");

	function SetTitle() {
		if (headerEls.length > 0) {
			title = headerEls[0].innerText.trim();
			return true;
		} else {
			return false;
		}
	}

	if (SetTitle() == false) {
		headerEls = document.querySelectorAll("h1.watch-title-container");

		if (SetTitle() == false)
			title = '';
	}

	var player = document.getElementsByClassName("video-stream")[0];

	var time = player.currentTime;

	title += " ";

	let minutes = Math.floor(time / 60)

	time = Math.floor(time - (minutes * 60));

	if (minutes > 60) {
		let hours = Math.floor(minutes / 60)
		minutes -= hours * 60;
		title += hours + "-";
	}

	title += minutes + "-" + time;

	title += " " + appendixTitle;

	var canvas = document.createElement("canvas");
	canvas.width = player.videoWidth;
    
	if(n === 0) {
		canvas.height = player.videoHeight;
		canvas.getContext('2d').drawImage(player, 0, 0, canvas.width, canvas.height);
		n++;
	} else {
		canvas.height = player.videoHeight*portion;
		canvas.getContext('2d').drawImage(player, 0, player.videoHeight*(1-portion), player.videoWidth, player.videoHeight*portion, 0, 0, canvas.width, canvas.height);
	}

	// 创建并设置 previewImage
	var previewImage = document.createElement("img");
	previewImage.className = "previewImage";
	previewImage.src = canvas.toDataURL('image/png');
	previewImageContainer.appendChild(previewImage);
	// previewImageContainer.appendChild(portionInput);
	previewContainer.style.display = "block";
}

function AddScreenshotButton(svgData) {
    var ytpRightControls = document.getElementsByClassName("ytp-right-controls")[0];
    if (ytpRightControls) {
        // 检查按钮是否已经存在
        var existingButton = ytpRightControls.getElementsByClassName("screenshotButton")[0];
        if (!existingButton) {
            var screenshotButton = document.createElement("div");
            screenshotButton.className = "screenshotButton ytp-button";
            screenshotButton.style.cssFloat = "left";
            screenshotButton.style.width = "48px";  
            screenshotButton.style.display = "flex";  // 使用 Flexbox 布局
            screenshotButton.style.justifyContent = "center";  // 水平居中
            screenshotButton.style.alignItems = "center";  // 垂直居中
            screenshotButton.innerHTML = svgData;
            screenshotButton.onclick = CaptureScreenshot;

            ytpRightControls.prepend(screenshotButton);
        }
    }
}

window.AddScreenshotButton = AddScreenshotButton;



