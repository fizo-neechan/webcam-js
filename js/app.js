import { GrayScaleFilter } from './grayScaleFilter.js';
import { ChannelFilter } from './channelFilter.js';
import { ChannelThresholdFilter } from './channelThresholdFilter.js';
import { YCbCrFilter } from './yCbCrFilter.js';
import { YCbCrThresholdFilter } from './yCbCrThresholdFilter.js';
import { RgbHsvFilter } from './rgbHsvFilter.js';
import { RgbHsvThresholdFilter } from './rgbHsvThresholdFilter.js';
import { FaceDetectionFilter } from './faceDetectionFilter.js';
import { MaskFaceFilter } from './maskFaceFilter.js';
import { WebcamRepeatFilter } from './webcamRepeatFilter.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

/**
 * Main application class for processing webcam images with various filters
 */
export class ImageProcessorApp {
  /**
   * Initializes the application by setting up DOM elements, filters, and event listeners
   */
  constructor() {
    this.initializeElements();
    this.initializeFilters();
    this.setupEventListeners();
  }

  /**
   * Initializes webcam video element and sets dimensions
   * @private
   */
  initializeElements() {
    this.webcamVideo = document.getElementById('webcam');
    this.webcamVideo.width = CANVAS_WIDTH;
    this.webcamVideo.height = CANVAS_HEIGHT;
  }

  /**
   * Initializes all image processing filters used in the application
   * @private
   */
  initializeFilters() {
    this.filters = {
      grayscale: new GrayScaleFilter('grayscale'),
      webcamRepeat: new WebcamRepeatFilter('webcamRepeat'),
      redChannel: new ChannelFilter('redChannel', 'red'),
      greenChannel: new ChannelFilter('greenChannel', 'green'),
      blueChannel: new ChannelFilter('blueChannel', 'blue'),
      redThreshold: new ChannelThresholdFilter('redThresholdCanvas', 'red', 'redThreshold'),
      greenThreshold: new ChannelThresholdFilter('greenThresholdCanvas', 'green', 'greenThreshold'),
      blueThreshold: new ChannelThresholdFilter('blueThresholdCanvas', 'blue', 'blueThreshold'),
      ycbcr: new YCbCrFilter('colorSpace2'),
      ycbcrThreshold: new YCbCrThresholdFilter('thresholdSpace2', 'colorSpace2Threshold'),
      rgbHsv: new RgbHsvFilter('colorSpace1'),
      rgbHsvThreshold: new RgbHsvThresholdFilter('thresholdSpace1', 'colorSpace1Threshold'),
      faceDetection: new FaceDetectionFilter('faceDetection'),
      maskFace: new MaskFaceFilter('faceDetection')
    };
  }

  /**
   * Sets up event listeners for buttons, sliders and keyboard events
   * @private
   */
  setupEventListeners() {
    document.getElementById('startCamera').addEventListener('click', () => this.startCamera());
    document.getElementById('captureImage').addEventListener('click', () => this.processImage());
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    
    ['red', 'green', 'blue', 'colorSpace1', 'colorSpace2'].forEach(type => {
      const slider = document.getElementById(`${type}Threshold`);
      const valueDisplay = document.getElementById(`${type}ThresholdValue`);
      slider.addEventListener('input', (e) => {
        valueDisplay.textContent = e.target.value;
        this.processImage();
      });
    });
  }

  /**
   * Starts the webcam stream and displays it in the video element
   * @returns {Promise<void>}
   * @throws {Error} If unable to access webcam
   */
  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT
        }
      });
      this.webcamVideo.srcObject = stream;
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Error accessing webcam. Please check your camera settings.');
    }
  }

  /**
   * Processes the current webcam frame through all filters
   * Applies various image processing effects including:
   * - Basic filters (grayscale, channel separation)
   * - Threshold filters
   * - Color space conversions (RGB to HSV, YCbCr)
   * - Face detection
   * @returns {Promise<void>}
   * @throws {Error} If image processing fails
   */
  async processImage() {
    try {
      // Process webcam repeat first as it's used as a reference
      this.filters.webcamRepeat.process(this.webcamVideo);
      
      // Process basic filters
      this.filters.grayscale.process(this.webcamVideo);
      this.filters.redChannel.process(this.webcamVideo);
      this.filters.greenChannel.process(this.webcamVideo);
      this.filters.blueChannel.process(this.webcamVideo);
      
      // Process threshold filters
      this.filters.redThreshold.process(this.webcamVideo);
      this.filters.greenThreshold.process(this.webcamVideo);
      this.filters.blueThreshold.process(this.webcamVideo);
      
      // Process color space conversions and thresholds
      this.filters.rgbHsv.process(this.webcamVideo);
      this.filters.rgbHsvThreshold.process(this.filters.rgbHsv.canvas);
      this.filters.ycbcr.process(this.webcamVideo);
      this.filters.ycbcrThreshold.process(this.filters.ycbcr.canvas);
      
      // Process face detection using the webcam repeat as source
      await this.filters.faceDetection.process(this.filters.webcamRepeat.canvas);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    }
  }

  /**
   * Handles keyboard events for applying face effects
   * Key mappings:
   * - 1: Grayscale effect
   * - 2: Blur effect
   * - 3: YCbCr effect
   * - 4: Pixelate effect
   * @param {KeyboardEvent} event - The keyboard event
   * @returns {Promise<void>}
   * @throws {Error} If effect application fails
   */
  async handleKeyPress(event) {
    try {
      const detections = this.filters.faceDetection.getDetections();
      if (detections.length > 0) {
        const face = detections[0].box;
        
        // Use webcam repeat as the source for face effects
        const sourceCanvas = this.filters.webcamRepeat.canvas;
        
        switch (event.key) {
          case '1':
            this.filters.maskFace.applyEffect('grayscale', face, sourceCanvas);
            break;
          case '2':
            this.filters.maskFace.applyEffect('blur', face, sourceCanvas);
            break;
          case '3':
            this.filters.maskFace.applyEffect('ycbcr', face, sourceCanvas);
            break;
          case '4':
            this.filters.maskFace.applyEffect('pixelate', face, sourceCanvas);
            break;
          default:
            console.warn('Unhandled key press:', event.key);
        }
      }
    } catch (error) {
      throw new Error('Error handling key press:', error);
    }
  }
}