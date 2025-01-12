exportclass ImageProcessor {
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
    document.getElementById("startCamera").addEventListener("click", () => this.startCamera());
    document.getElementById("captureImage").addEventListener("click", () => this.captureImage());
    document.getElementById("processImage").addEventListener("click", () => this.processImage());

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
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
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

  async processFaceDetection() {
    const canvas = this.canvasElements.faceDetection;
    const ctx = this.contexts.faceDetection;

    // Draw original image
    ctx.drawImage(this.webcamVideo, 0, 0, 160, 120);

    // Detect faces
    const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions());

    // Draw detection boxes
    detections.forEach((detection) => {
      const { x, y, width, height } = detection.box;
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    });
  }

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
      faceRegion.height
    );
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    this.contexts.faceDetection.putImageData(imageData, faceRegion.x, faceRegion.y);
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
      faceRegion.height
    );

    ctx.filter = "none";
    ctx.clearRect(faceRegion.x, faceRegion.y, faceRegion.width, faceRegion.height);
    ctx.drawImage(
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

  applyPixelateFace(faceRegion) {
    const ctx = this.contexts.faceDetection;
    const blockSize = 5;

    // Get face region data
    const imageData = ctx.getImageData(faceRegion.x, faceRegion.y, faceRegion.width, faceRegion.height);
    const data = imageData.data;

    // Process each block
    for (let y = 0; y < faceRegion.height; y += blockSize) {
      for (let x = 0; x < faceRegion.width; x += blockSize) {
        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        // Calculate average color for block
        for (let by = 0; by < blockSize && y + by < faceRegion.height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < faceRegion.width; bx++) {
            const idx = ((y + by) * faceRegion.width + (x + bx)) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }

        // Set average color for entire block
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        for (let by = 0; by < blockSize && y + by < faceRegion.height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < faceRegion.width; bx++) {
            const idx = ((y + by) * faceRegion.width + (x + bx)) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
          }
        }
      }
    }

    ctx.putImageData(imageData, faceRegion.x, faceRegion.y);
  }

  async handleKeyPress(event) {
    const detections = await faceapi.detectAllFaces(
      this.canvasElements.faceDetection,
      new faceapi.TinyFaceDetectorOptions()
    );

    if (detections.length > 0) {
      const face = detections[0].box;

      switch (event.key) {
        case "1":
          this.applyGrayscaleFace(face);
          break;
        case "2":
          this.applyBlurFace(face);
          break;
        case "3":
          this.applyPixelateFace(face);
          break;
        case "4":
          // Reset face detection canvas
          this.processFaceDetection();
          break;
      }
    }
  }
}