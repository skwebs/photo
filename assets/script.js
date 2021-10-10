"use strict";
window.addEventListener("DOMContentLoaded", function () {
  function _(e) {
    return document.querySelector(e);
  }

  //	 IMAGE LOAD SECTION ================================
  var selectImage = _("#selectImage");
  var fileInfo = _("#fileInfo");
  var uploadedImage = _("#uploadedImage");
  var outputCanvas = _("#outputCanvas");
  var numOfRow = _("#numberOfImageRow");
  var setBgColor = "teal";
  var originalImageWidth, originalImageHeight;
  var isFileLoaded = false;
  var mimeType;

  var numTxt = [
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
  ];
  var rn = "";
  for (let i = 1; i < 15; i++) {
    rn += '<option value="' + i + '">' + numTxt[i] + " Rows</option>";
  }
  numOfRow.innerHTML = rn;

  selectImage.addEventListener("change", (event) => {
    console.time("FileOpen");
    let files = event.target.files;
    if (files && files.length > 0) {
      isFileLoaded = true;
      let file = files[0];
      console.log(file);
      // leader start section
      console.time("Process Time");

      // show file details
      fileInfo.innerHTML = "File: " + file.name;
      //fileSize.html("Size: " + ((file.size / 1024).toFixed(2)) + "KB;&nbsp&nbsp");
      // file reader for data url section
      let fileReaderForDataURL = new FileReader();
      fileReaderForDataURL.onloadend = function (e) {
        uploadedImage.src = e.target.result;
        // open all section on image onload
        $("#mainCollapseContent").collapse("show");
        // find image dimensions
        let imageForDimenstion = new Image();
        imageForDimenstion.src = e.target.result;
        imageForDimenstion.onload = function () {
          originalImageHeight = this.naturalHeight || this.height;
          originalImageWidth = this.naturalWidth || this.width;
          loadCanvas();
          console.log(
            "width :" + originalImageWidth + ", height : " + originalImageHeight
          );
          console.log(
            "ratio : " + imageRatio(originalImageWidth, originalImageHeight)
          );
        };
        // console image url data
        console.log(e.target.result);
      };
      fileReaderForDataURL.readAsDataURL(file);
      // file reader for array buffer section
      let fileReaderForArrayBuffer = new FileReader();
      fileReaderForArrayBuffer.onloadend = function (evt) {
        if (evt.target.readyState === FileReader.DONE) {
          let uInt8Array = new Uint8Array(evt.target.result);
          let bytes = [];
          uInt8Array.forEach((byte) => {
            bytes.push(byte.toString(16));
          });
          let hex = bytes.join("").toUpperCase();
          mimeType = checkMimeType(hex);
        }
        console.timeEnd("FileOpen");
        console.time("Before loop");
        //loadCanvas();
      };
      let BLOB = file.slice(0, 4);
      fileReaderForArrayBuffer.readAsArrayBuffer(BLOB);
    }
  });
  //	IMAGE MIME SECTION ==================================
  var checkMimeType = (signature) => {
    switch (signature) {
      case "89504E47":
        return "image/png";
      case "47494638":
        return "image/gif";
      case "25504446":
        return "application/pdf";
      case "FFD8FFDB":
      case "FFD8FFE0":
      case "FFD8FFE1":
        return "image/jpeg";
      case "504B0304":
        return "application/zip";
      default:
        return "Unknown filetype";
    }
  };

  function imageRatio(w, h) {
    let gcd = hcf(w, h);
    let wr = w / gcd;
    let hr = h / gcd;
    let ratioString = wr + "/" + hr;
    return ratioString;
  }

  function hcf(x, y) {
    x = Math.abs(x);
    y = Math.abs(y);
    while (y) {
      let t = y;
      y = x % y;
      x = t;
    }
    return x;
  }
  numOfRow.addEventListener("change", () => {
    if (isFileLoaded) {
      loadCanvas();
    }
  });
  var numOfColumn = _("#numberOfImageColumn");
  var cn = "";
  for (let i = 1; i < 15; i++) {
    cn += '<option value="' + i + '">' + numTxt[i] + " Columns</option>";
  }
  numOfColumn.innerHTML = cn;

  numOfColumn.addEventListener("change", () => {
    if (isFileLoaded) {
      loadCanvas();
    }
  });

  function loadCanvas() {
    let canvas1 = _("#canvas1"); //document.createElement("canvas"); //document.getElementById("canvas1");
    var imageWidth = 600;
    var imgRenderRatio = 20 / 23;
    var imageHeight = (imageWidth * originalImageHeight) / originalImageWidth;
    var imageBorder = imageWidth / 100;
    canvas1.width = imageWidth;
    canvas1.height = imageHeight;

    // STEP 1 (add border in image)
    let ctx1 = canvas1.getContext("2d");
    // this is for image border color
    ctx1.fillStyle = "#000";
    ctx1.fillRect(0, 0, imageWidth, imageHeight);
    // transparent bg image background color
    ctx1.fillStyle = setBgColor;
    ctx1.fillRect(
      imageBorder,
      imageBorder,
      imageWidth - imageBorder * 2,
      imageHeight - imageBorder * 2
    );
    // copying image
    ctx1.drawImage(
      uploadedImage,
      imageBorder,
      imageBorder,
      imageWidth - imageBorder * 2,
      imageHeight - imageBorder * 2
    );

    // // required parameters
    // ctx.drawImage(sourceImage, drawX, drawY);
    // // can add draw width & draw height (optional)
    // ctx.drawImage(sourceImage, drawX, drawY, drawWidth, drawHeight);
    // // can add source X, source Y, source width & source height (optional)
    // ctx.drawImage(sourceImage, sourceX, sourceY, sourceWidth, sourceHeight, drawX, drawY, drawWidth, drawHeight);

    // STEP 2 (arrange image for printing)
    let ctx2 = outputCanvas.getContext("2d");
    var A4pageRatio = 210 / 297;
    let numberOfImageRow = numOfRow.value;
    let numberOfImageColumn = numOfColumn.value;
    // set gap between images
    let imageMargin = imageWidth / 20;
    let imageMarginX = imageMargin;
    let imageMarginY = imageMargin;
    // whole image size will be ready for download
    let canvasWidth =
      numberOfImageColumn * (imageWidth + imageMargin) + imageMargin;
    let canvasHeight = canvasWidth / A4pageRatio; // * 297 / 210; // size ratio of A4 paper size
    outputCanvas.width = canvasWidth;
    outputCanvas.height = canvasHeight;
    // because both canvas not perform once so add this in timeout method
    setTimeout(() => {
      // fill bg white
      ctx2.fillStyle = "#fff";
      ctx2.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
      console.timeEnd("Before loop");
      console.time("Loop Time");
      for (let r = 0; r < numberOfImageRow; r++) {
        // for every row image column (x axis point) reset to initial point
        imageMarginX = imageMargin;
        for (let c = 0; c < numberOfImageColumn; c++) {
          ctx2.drawImage(
            canvas1,
            imageMarginX,
            imageMarginY,
            imageWidth,
            imageHeight
          );
          // change x axis according to number of image column
          imageMarginX += imageWidth + imageMargin;
          console.log("x : " + imageMarginX + ", y : " + imageMarginY);
        }
        // change y axis according to number of image row
        imageMarginY += imageHeight + imageMargin;
      }
      console.timeEnd("Loop Time");
      console.log("loops ended.");
      // image download link
      document
        .getElementById("download-link")
        .setAttribute("href", outputCanvas.toDataURL(mimeType));
      // leader end section
      console.timeEnd("Process Time");
    }, 50);
  }

  // change settings button text according to collapse events
  let settingBtn = $("#settingBtn");
  $("#imageSettings")
    .on("show.bs.collapse", (e) => {
      settingBtn.html("Close Image Settings");
    })
    .on("hide.bs.collapse", () => {
      settingBtn.html("Open Image Settings");
    });

  // change preview button text according to collapse events
  let previewBtn = $("#previewBtn");
  $("#imagePreview")
    .on("show.bs.collapse", (e) => {
      previewBtn.html("Close Image Preview");
    })
    .on("hide.bs.collapse", () => {
      previewBtn.html("Open Image Preview");
    });
  // hide collpase on click outside
  // $(document).on("click", window, () => {
  // 	$("#imagePreview, #imageSettings").collapse("hide");
  // })

  // COLOR PICKER
  const PICKR = Pickr.create({
    el: ".color-picker",
    theme: "monolith", //'classic', // or 'monolith', or 'nano'
    default: "teal",
    swatches: [
      "rgba(244, 67, 54, 1)",
      "rgba(233, 30, 99, 0.95)",
      "rgba(156, 39, 176, 0.9)",
      "rgba(103, 58, 183, 0.85)",
      "rgba(63, 81, 181, 0.8)",
      "rgba(33, 150, 243, 0.75)",
      "rgba(3, 169, 244, 0.7)",
      "rgba(0, 188, 212, 0.7)",
      "rgba(0, 150, 136, 0.75)",
      "rgba(76, 175, 80, 0.8)",
      "rgba(139, 195, 74, 0.85)",
      "rgba(205, 220, 57, 0.9)",
      "rgba(255, 235, 59, 0.95)",
      "rgba(255, 193, 7, 1)",
    ],

    components: {
      // Main components
      preview: true,
      opacity: true,
      hue: true,

      // Input / output Options
      interaction: {
        hex: true,
        // rgba: true,
        // hsla: true,
        // hsva: true,
        // cmyk: true,
        input: true,
        //clear: true,
        save: true,
      },
    },
  });

  PICKR
    // 	.on('init', instance => {
    // console.log('init', instance);
    // }).on('hide', instance => {
    // console.log('hide', instance);
    // }).on('show', (color, instance) => {
    // console.log('show', color, instance);
    // }).on('save', (color, instance) => {
    // console.log('save', color, instance);
    // }).on('clear', instance => {
    // console.log('clear', instance);
    // })
    .on("change", (color, instance) => {
      console.log("change", color, instance);
      setBgColor = color.toHEXA().toString();
      if (isFileLoaded) {
        loadCanvas();
      }
      _("#pickerWrap").style.backgroundColor = setBgColor;
    });
  // .on('changestop', instance => {
  // console.log('changestop', instance);
  // }).on('cancel', instance => {
  // console.log('cancel', instance);
  // }).on('swatchselect', (color, instance) => {
  // console.log('swatchselect', color, instance);
  // });
});
