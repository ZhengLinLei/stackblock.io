// ================================================================================

// Github: https://github.com/hughsk/canvas-pixels
//
// Get Pixel amount in a 3D canvas
function getPixels3d(gl) {
    var canvas = gl.canvas
    var height = canvas.height
    var width  = canvas.width
    var buffer = new Uint8Array(width * height * 4)
  
    gl.readPixels(0, 0
      , canvas.width
      , canvas.height
      , gl.RGBA
      , gl.UNSIGNED_BYTE
      , buffer
    );
  
    return buffer
}

// Get Pixel amount in a 2D canvas
function getPixels2d(ctx) {
    var canvas = ctx.canvas
    var height = canvas.height
    var width  = canvas.width
  
    return ctx.getImageData(0, 0, width, height).data
}



// ================================================================================


// WebGL to 2D CANVAS
// Github: https://github.com/Experience-Monks/webgl-to-canvas2d
const Webgl2canvas = (webgl, canvas2D) => {

    var outCanvas = canvas2D ? canvas2D.canvas || canvas2D : document.createElement('canvas');
    var outContext = outCanvas.getContext('2d');
    var outImageData;
  
    webgl = (webgl instanceof WebGLRenderingContext) ? webgl : (webgl.getContext('webgl2') || webgl.getContext('webgl') || webgl.getContext('experimental-webgl'));

    outCanvas.width = webgl.canvas.width;
    outCanvas.height = webgl.canvas.height;

    outImageData = outContext.getImageData(0, 0, outCanvas.width, outCanvas.height);
  
    outImageData.data.set(new Uint8ClampedArray(getPixels3d(webgl).buffer));
    outContext.putImageData(outImageData, 0, 0);
    outContext.translate(0, outCanvas.height);
    outContext.scale(1, -1);
    outContext.drawImage(outCanvas, 0, 0);
    outContext.setTransform(1, 0, 0, 1, 0, 0);
  
    return outCanvas;
};


// ================================================================================

// Stackoverflow: https://stackoverflow.com/a/17906462
// Stackoverflow: https://stackoverflow.com/questions/17906169/how-to-copy-from-one-canvas-to-other-canvas
//
// Convert WebGL Canvas to Image
// Canvas(WebGL) -> Canvas(2D){Do changes} -> Image(JPG, PNG)
const DrawCanvasCopy = (canvas, callback, callbackBlob) => {
    let c = Webgl2canvas(canvas);    
    // Prepare new canvas
    callback(c.getContext('2d'));
    // Export
    c.toBlob(callbackBlob);
    // Delete
    c.remove();
}

// ================================================================================

// Stackblock: https://stackoverflow.com/questions/68362603/share-image-via-social-media-from-pwa
//
// Convert blob to image share
const Blob2Share = async(blob, emptyText = false) => {
    let tries = 0, maxTries = 3;
    if (!('share' in navigator) || !('canShare' in navigator)) {
      return false;
    }
    const files = [new File([blob], 'newRecord.png', { type: blob.type })];
    const shareData = {
        files,
    };
    // Add only if it's not IOS
    if(!emptyText) {
        shareData.title = 'Stackblock.io';
        shareData.text = 'Play with me. In Stackblock.io';
    }

    if (navigator.canShare(shareData)) {
        while(true) {
            try {
                await navigator.share(shareData);
                // If no errors return
                return true;
            } catch (err) {
                if (err.name !== 'AbortError' || err.name.toLowerCase() !== 'aborterror') {
                    if (tries >= maxTries) return false;

                    tries++;
                    continue;
                }
                return true;
            }
        }
    } else {
        console.warn('Sharing not supported', shareData);
        return false;           
    }
};

const Blob2Download = (blob) => {
    let a = document.createElement('a');
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = "StackBlock_newRecord.png";
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}