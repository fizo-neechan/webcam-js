class ImageProcessor {
  detections = [];

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.loadFaceDetectionModels();
  }

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

  setupEventListeners() {
    document
      .getElementById("startCamera")
      .addEventListener("click", () => this.startCamera());
    document
      .getElementById("captureImage")
      .addEventListener("click", () => this.captureImage());
    document
      .getElementById("processImage")
      .addEventListener("click", () => this.processImage());

    // Threshold sliders
    const sliders = ["red", "green", "blue", "colorSpace1", "colorSpace2"];
    sliders.forEach((type) => {
      const slider = document.getElementById(`${type}Threshold`);
      const valueDisplay = document.getElementById(`${type}ThresholdValue`);
      slider.addEventListener("input", (e) => {
        valueDisplay.textContent = e.target.value;
        this.processImage();
      });
    });

    // Keyboard events for face effects
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }

  async loadFaceDetectionModels() {
    try {
      // Wait for face-api.js to be loaded
      await new Promise((resolve) => {
        if (window.faceapi) {
          resolve();
        } else {
          // Wait for script to load
          document
            .querySelector('script[src*="face-api"]')
            .addEventListener("load", resolve);
        }
      });

      // Load models from CDN with correct path structure
      const modelBaseUrl =
        "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
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

  captureImage() {
    // Capture current frame from webcam
    for (let [key, context] of Object.entries(this.contexts)) {
      context.drawImage(this.webcamVideo, 0, 0, 160, 120);
    }
    this.processImage();
  }

  processImage() {
    this.processGrayscaleAndBrightness();
    this.processColorChannels();
    this.processThresholds();
    this.processColorSpaces();
    this.processFaceDetection();
    this.processHSVThreshold();
    this.processThresholdFromColorSpace2();
  }

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

  processColorSpaces() {
    // Example color space conversions (RGB to HSV and RGB to YCbCr)
    const ctx1 = this.contexts.colorSpace1;
    const ctx2 = this.contexts.colorSpace2;
    const imageData1 = ctx1.getImageData(0, 0, 160, 120);
    const imageData2 = ctx2.getImageData(0, 0, 160, 120);

    this.rgbToHSV(imageData1.data);
    this.rgbToYCbCr(imageData2.data);

    ctx1.putImageData(imageData1, 0, 0);
    ctx2.putImageData(imageData2, 0, 0);
  }

  processHSVThreshold() {
    const ctx = this.contexts.thresholdSpace1;
    const threshold = document.getElementById("colorSpace1Threshold").value;

    // Create new ImageData for thresholded result
    const imageData = ctx.createImageData(160, 120);
    const data = imageData.data;

    // Apply threshold to Value component of HSV
    for (let i = 0; i < this.hsvData.length; i += 3) {
      const h = this.hsvData[i];
      const s = this.hsvData[i + 1];
      const v = this.hsvData[i + 2];

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

  async processFaceDetection() {
    const canvas = this.canvasElements.faceDetection;
    const ctx = this.contexts.faceDetection;

    // Draw original image
    ctx.drawImage(this.webcamVideo, 0, 0, 160, 120);

    // Detect faces
    this.detections = await faceapi.detectAllFaces(
      canvas,
      new faceapi.TinyFaceDetectorOptions(),
    );

    // Draw detection boxes
    this.detections.forEach((detection) => {
      const { x, y, width, height } = detection.box;
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    });
  }

  // Color space conversion helpers
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

  // Face effect methods
  applyGrayscaleFace(faceRegion) {
    const imageData = this.contexts.faceDetection.getImageData(
      faceRegion.x,
      faceRegion.y,
      faceRegion.width,
      faceRegion.height,
    );
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    this.contexts.faceDetection.putImageData(
      imageData,
      faceRegion.x,
      faceRegion.y,
    );
  }

  applyColorspaceFace(faceRegion) {
    const imageData = this.contexts.faceDetection.getImageData(
      faceRegion.x,
      faceRegion.y,
      faceRegion.width,
      faceRegion.height,
    );

    this.rgbToYCbCr(imageData.data);

    this.contexts.faceDetection.putImageData(
      imageData,
      faceRegion.x,
      faceRegion.y,
    );
  }

  applyBlurFace(faceRegion) {
    const ctx = this.contexts.faceDetection;
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
      faceRegion.height,
    );

    ctx.filter = "none";
    ctx.clearRect(
      faceRegion.x,
      faceRegion.y,
      faceRegion.width,
      faceRegion.height,
    );
    ctx.drawImage(
      tempCanvas,
      0,
      0,
      faceRegion.width,
      faceRegion.height,
      faceRegion.x,
      faceRegion.y,
      faceRegion.width,
      faceRegion.height,
    );
  }

  applyPixelateFace(faceRegion) {
    const ctx = this.contexts.faceDetection;
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
      faceRegion.height,
    );

    // Process blocks
    for (let y = 0; y < faceRegion.height; y += blockSize) {
      for (let x = 0; x < faceRegion.width; x += blockSize) {
        // Get the pixel data for this block
        const blockData = tempCtx.getImageData(
          x,
          y,
          Math.min(blockSize, faceRegion.width - x),
          Math.min(blockSize, faceRegion.height - y),
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
    ctx.drawImage(
      tempCanvas,
      0,
      0,
      faceRegion.width,
      faceRegion.height,
      faceRegion.x,
      faceRegion.y,
      faceRegion.width,
      faceRegion.height,
    );
  }

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
