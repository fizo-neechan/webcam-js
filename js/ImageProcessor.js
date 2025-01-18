/**
 * @class ImageProcessor
 * @classdesc A class to handle image processing tasks including face detection, color space conversions, and various image effects.
 */
class ImageProcessor {
  detections = [];

  /**
   * @constructor
   * Initializes the ImageProcessor instance by setting up elements, event listeners, and loading face detection models.
   */
  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.loadFaceDetectionModels();
  }

  /**
   * Initializes all canvas elements and their contexts.
   * @async
   * @function
   */
  async initializeElements() {
    // Initialize all canvas elements
    this.webcamVideo = document.getElementById("webcam");
    this.canvasElements = {
      grayscale: document.getElementById("grayscale"),
      redChannel: document.getElementById("redChannel"),
      greenChannel: document.getElementById("greenChannel"),
      blueChannel: document.getElementById("blueChannel"),
      redThreshold: document.getElementById("redThresholdCanvas"),
      greenThreshold: document.getElementById("greenThresholdCanvas"),
      blueThreshold: document.getElementById("blueThresholdCanvas"),
      webcamRepeat: document.getElementById("webcamRepeat"),
      colorSpace1: document.getElementById("colorSpace1"),
      colorSpace2: document.getElementById("colorSpace2"),
      faceDetection: document.getElementById("faceDetection"),
      thresholdSpace1: document.getElementById("thresholdSpace1"),
      thresholdSpace2: document.getElementById("thresholdSpace2"),
    };

    // Initialize contexts
    this.contexts = {};
    for (let [key, canvas] of Object.entries(this.canvasElements)) {
      canvas.width = 160;
      canvas.height = 120;
      this.contexts[key] = canvas.getContext("2d");
    }
  }

  /**
   * Sets up event listeners for buttons and sliders.
   * @function
   */
  setupEventListeners() {
    document.getElementById("startCamera").addEventListener("click", () => this.startCamera());
    document.getElementById("captureImage").addEventListener("click", () => this.captureImage());

    // Threshold sliders
    const sliders = ["red", "green", "blue", "colorSpace1", "colorSpace2"];
    sliders.forEach((type) => {
      const slider = document.getElementById(`${type}Threshold`);
      const valueDisplay = document.getElementById(`${type}ThresholdValue`);
      slider.addEventListener("input", (e) => {
        valueDisplay.textContent = e.target.value;
        // this.processImage();
      });
    });

    // Keyboard events for face effects
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }

  /**
   * Loads face detection models from a CDN.
   * @async
   * @function
   */
  async loadFaceDetectionModels() {
    try {
      // Wait for face-api.js to be loaded
      await new Promise((resolve) => {
        if (window.faceapi) {
          resolve();
        } else {
          // Wait for script to load
          document.querySelector('script[src*="face-api"]').addEventListener("load", resolve);
        }
      });

      // Load models from CDN with correct path structure
      const modelBaseUrl = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelBaseUrl),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelBaseUrl),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelBaseUrl),
      ]);
      console.log("Face detection models loaded successfully");
    } catch (error) {
      console.error("Error loading face detection models:", error);
    }
  }

  /**
   * Starts the webcam and streams the video to the video element.
   * @async
   * @function
   */
  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 160,
          height: 120,
        },
      });
      this.webcamVideo.srcObject = stream;
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  }

  /**
   * Captures the current frame from the webcam and processes the image.
   * @function
   */
  captureImage() {
    // Capture current frame from webcam
    for (let [key, context] of Object.entries(this.contexts)) {
      context.drawImage(this.webcamVideo, 0, 0, 160, 120);
    }
    this.processImage();
  }

  /**
   * Processes the captured image by applying various transformations and effects.
   * @function
   */
  processImage() {
    this.processGrayscaleAndBrightness();
    this.processColorChannels();
    this.processThresholds();
    this.processColorSpaces();
    this.processFaceDetection();
    this.processHSVThreshold();
    this.processThresholdFromColorSpace2();
  }

  /**
   * Converts the image to grayscale and increases its brightness.
   * @function
   */
  processGrayscaleAndBrightness() {
    const ctx = this.contexts.grayscale;
    const imageData = ctx.getImageData(0, 0, 160, 120);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      // Increase brightness by 20%
      const brightened = Math.min(gray * 1.2, 255);

      data[i] = brightened;
      data[i + 1] = brightened;
      data[i + 2] = brightened;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Processes the red, green, and blue color channels of the image.
   * @function
   */
  processColorChannels() {
    const channels = ["red", "green", "blue"];
    channels.forEach((channel, index) => {
      const ctx = this.contexts[`${channel}Channel`];
      const imageData = ctx.getImageData(0, 0, 160, 120);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = data[i + index];
        data[i] = channel === "red" ? value : 0;
        data[i + 1] = channel === "green" ? value : 0;
        data[i + 2] = channel === "blue" ? value : 0;
      }

      ctx.putImageData(imageData, 0, 0);
    });
  }

  /**
   * Applies thresholding to the red, green, and blue color channels.
   * @function
   */
  processThresholds() {
    const channels = ["red", "green", "blue"];
    channels.forEach((channel, index) => {
      const ctx = this.contexts[`${channel}Threshold`];
      const imageData = ctx.getImageData(0, 0, 160, 120);
      const data = imageData.data;
      const threshold = document.getElementById(`${channel}Threshold`).value;

      for (let i = 0; i < data.length; i += 4) {
        const value = data[i + index] > threshold ? 255 : 0;
        data[i] = channel === "red" ? value : 0;
        data[i + 1] = channel === "green" ? value : 0;
        data[i + 2] = channel === "blue" ? value : 0;
        data[i + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
    });
  }

  /**
   * Converts the image to different color spaces (e.g., HSV, YCbCr).
   * @function
   */
  processColorSpaces() {
    // Example color space conversions (RGB to HSV and RGB to YCbCr)
    const ctx1 = this.contexts.colorSpace1;
    const ctx2 = this.contexts.colorSpace2;
    const imageData1 = ctx1.getImageData(0, 0, 160, 120);
    const imageData2 = ctx2.getImageData(0, 0, 160, 120);
    imageData1.data;
    this.rgbToYCbCr(imageData2.data);

    ctx1.putImageData(imageData1, 0, 0);
    ctx2.putImageData(imageData2, 0, 0);
  }

  /**
   * Applies a threshold to the Value component of the HSV color space.
   * @function
   */
  processHSVThreshold() {
    const ctx = this.contexts.thresholdSpace1;
    const threshold = document.getElementById("colorSpace1Threshold").value;

    // Create new ImageData for thresholded result
    const imageData = ctx.createImageData(160, 120);
    const data = imageData.data;

    const hsvData = ctx.getImageData(0, 0, 160, 120).data;

    // Apply threshold to Value component of HSV
    for (let i = 0; i < hsvData.length; i += 3) {
      const h = hsvData[i];
      const s = hsvData[i + 1];
      const v = hsvData[i + 2];

      // Calculate output pixel index (4 components: R,G,B,A)
      const pixelIndex = (i / 3) * 4;

      // Threshold on Value component
      if (v > threshold) {
        // If above threshold, keep original HSV converted back to RGB
        const rgb = this.hsvToRgb(h, s, v);
        data[pixelIndex] = rgb.r;
        data[pixelIndex + 1] = rgb.g;
        data[pixelIndex + 2] = rgb.b;
      } else {
        // If below threshold, set to black
        data[pixelIndex] = 0;
        data[pixelIndex + 1] = 0;
        data[pixelIndex + 2] = 0;
      }
      data[pixelIndex + 3] = 255; // Alpha channel
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Applies a threshold to the Y component of the YCbCr color space.
   * @function
   */
  processThresholdFromColorSpace2() {
    const ctx = this.contexts.thresholdSpace2; // Get context for the threshold output
    const colorSpace2Ctx = this.contexts.colorSpace2; // Get context of YCbCr image

    // Get threshold value from slider
    const threshold = document.getElementById("colorSpace2Threshold").value;

    // Get YCbCr image data
    const imageData = colorSpace2Ctx.getImageData(0, 0, 160, 120);
    const data = imageData.data;

    // Create output image data
    const outputImageData = ctx.createImageData(160, 120);
    const outputData = outputImageData.data;

    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
      // Get Y component (stored in red channel)
      const y = data[i];

      // Apply threshold to Y (luminance) component
      if (y > threshold) {
        outputData[i] = 255; // R
        outputData[i + 1] = 255; // G
        outputData[i + 2] = 255; // B
      } else {
        outputData[i] = 0; // R
        outputData[i + 1] = 0; // G
        outputData[i + 2] = 0; // B
      }
      outputData[i + 3] = 255; // Alpha
    }

    // Draw the thresholded image
    ctx.putImageData(outputImageData, 0, 0);
  }

  /**
   * Detects faces in the image and draws detection boxes around them.
   * @async
   * @function
   */
  async processFaceDetection() {
    const canvas = this.canvasElements.faceDetection;
    const ctx = this.contexts.faceDetection;

    // Draw original image
    ctx.drawImage(this.webcamVideo, 0, 0, 160, 120);

    // Detect faces
    this.detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions());

    // Draw detection boxes
    this.detections.forEach((detection) => {
      const { x, y, width, height } = detection.box;
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    });
  }

  /**
   * Converts RGB data to HSV color space.
   * @param {Uint8ClampedArray} data - The image data in RGB format.
   * @function
   */
  rgbToHSV(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;

      let h = 0;
      if (diff !== 0) {
        if (max === r) {
          h = 60 * (((g - b) / diff) % 6);
        } else if (max === g) {
          h = 60 * ((b - r) / diff + 2);
        } else {
          h = 60 * ((r - g) / diff + 4);
        }
      }

      const s = max === 0 ? 0 : diff / max;
      const v = max;

      // Convert HSV to displayable RGB
      data[i] = (h * 255) / 360;
      data[i + 1] = s * 255;
      data[i + 2] = v * 255;
    }
  }

  /**
   * Converts HSV values to RGB format.
   * @param {number} h - Hue value.
   * @param {number} s - Saturation value.
   * @param {number} v - Value (brightness) value.
   * @returns {Object} An object containing r, g, and b values.
   * @function
   */
  hsvToRgb(h, s, v) {
    h = (h / 255) * 360;
    s = s / 255;
    v = v / 255;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r, g, b };
  }

  /**
   * Converts RGB data to YCbCr color space.
   * @param {Uint8ClampedArray} data - The image data in RGB format.
   * @function
   */
  rgbToYCbCr(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // RGB to YCbCr conversion
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      data[i] = y; // Y
      data[i + 1] = cb; // Cb
      data[i + 2] = cr; // Cr
    }
  }

  /**
   * Applies a grayscale effect to a face region.
   * @param {Object} faceRegion - The region of the face to apply the effect to.
   * @function
   */
  applyGrayscaleFace(faceRegion) {
    const imageData = this.contexts.webcamRepeat.getImageData(faceRegion.x, faceRegion.y, faceRegion.width, faceRegion.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    this.contexts.faceDetection.putImageData(imageData, faceRegion.x, faceRegion.y);
  }

  /**
   * Applies a YCbCr color space effect to a face region.
   * @param {Object} faceRegion - The region of the face to apply the effect to.
   * @function
   */
  applyColorspaceFace(faceRegion) {
    const imageData = this.contexts.webcamRepeat.getImageData(faceRegion.x, faceRegion.y, faceRegion.width, faceRegion.height);

    this.rgbToYCbCr(imageData.data);

    this.contexts.faceDetection.putImageData(imageData, faceRegion.x, faceRegion.y);
  }

  /**
   * Applies a blur effect to a face region.
   * @param {Object} faceRegion - The region of the face to apply the effect to.
   * @function
   */
  applyBlurFace(faceRegion) {
    const faceDetectionCtx = this.contexts.faceDetection; // Get context for the face detection canvas
    const ctx = this.contexts.webcamRepeat;
    const blurRadius = 10;

    ctx.filter = `blur(${blurRadius}px)`;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = faceRegion.width;
    tempCanvas.height = faceRegion.height;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.drawImage(
      ctx.canvas,
      faceRegion.x,
      faceRegion.y,
      faceRegion.width,
      faceRegion.height,
      0,
      0,
      faceRegion.width,
      faceRegion.height
    );

    faceDetectionCtx.filter = "none";
    faceDetectionCtx.clearRect(faceRegion.x, faceRegion.y, faceRegion.width, faceRegion.height);
    faceDetectionCtx.drawImage(
      tempCanvas,
      0,
      0,
      faceRegion.width,
      faceRegion.height,
      faceRegion.x,
      faceRegion.y,
      faceRegion.width,
      faceRegion.height
    );
  }

  /**
   * Applies a pixelation effect to a face region.
   * @param {Object} faceRegion - The region of the face to apply the effect to.
   * @function
   */
  applyPixelateFace(faceRegion) {
    const ctx = this.contexts.webcamRepeat;
    const faceDetectionCtx = this.contexts.faceDetection;
    const blockSize = 5;

    // Create a temporary canvas for pixel manipulation
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = faceRegion.width;
    tempCanvas.height = faceRegion.height;
    const tempCtx = tempCanvas.getContext("2d");

    // Copy face region to temporary canvas
    tempCtx.drawImage(
      ctx.canvas,
      faceRegion.x,
      faceRegion.y,
      faceRegion.width,
      faceRegion.height,
      0,
      0,
      faceRegion.width,
      faceRegion.height
    );

    // Process blocks
    for (let y = 0; y < faceRegion.height; y += blockSize) {
      for (let x = 0; x < faceRegion.width; x += blockSize) {
        // Get the pixel data for this block
        const blockData = tempCtx.getImageData(
          x,
          y,
          Math.min(blockSize, faceRegion.width - x),
          Math.min(blockSize, faceRegion.height - y)
        );

        // Calculate average RGB values
        let sumR = 0,
          sumG = 0,
          sumB = 0;
        let count = 0;

        for (let i = 0; i < blockData.data.length; i += 4) {
          sumR += blockData.data[i];
          sumG += blockData.data[i + 1];
          sumB += blockData.data[i + 2];
          count++;
        }

        const avgR = Math.round(sumR / count);
        const avgG = Math.round(sumG / count);
        const avgB = Math.round(sumB / count);

        // Fill the block with the average color
        tempCtx.fillStyle = `rgb(${avgR}, ${avgG}, ${avgB})`;
        tempCtx.fillRect(x, y, blockSize, blockSize);
      }
    }

    // Draw the pixelated result back to the main canvas
    faceDetectionCtx.drawImage(
      tempCanvas,
      0,
      0,
      faceRegion.width,
      faceRegion.height,
      faceRegion.x,
      faceRegion.y,
      faceRegion.width,
      faceRegion.height
    );
  }

  /**
   * Handles key press events to apply different face effects.
   * @param {KeyboardEvent} event - The keyboard event.
   * @async
   * @function
   */
  async handleKeyPress(event) {
    console.log("Pressed", event.key);
    // this.detections = await faceapi.detectAllFaces(this.canvasElements.faceDetection, new faceapi.TinyFaceDetectorOptions());

    console.log(this.detections);
    if (this.detections.length > 0) {
      const face = this.detections[0].box;

      switch (event.key) {
        case "1":
          this.applyGrayscaleFace(face);
          break;
        case "2":
          this.applyBlurFace(face);
          break;
        case "3":
          this.applyColorspaceFace(face);
          break;
        case "4":
          this.applyPixelateFace(face);
          break;
      }
    }
  }
}

// DONT CHANGE

if (typeof module !== "undefined" && module.exports) {
  module.exports = { ImageProcessor };
} else {
  window.ImageProcessor = ImageProcessor;
}
