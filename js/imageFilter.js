import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants.js";

/**
 * A class that provides basic image filtering functionality using HTML5 Canvas.
 * @class ImageFilter
 */
export class ImageFilter {
  /**
   * Creates an instance of ImageFilter.
   * @constructor
   * @param {string} canvasId - The ID of the canvas element to use for image processing.
   */
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.initializeCanvas();
  }

  /**
   * Initializes the canvas with predefined width and height settings.
   * Sets up the 2D rendering context.
   * @private
   * @throws {Error} If canvas element is not found or context cannot be obtained
   */
  initializeCanvas() {
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.context = this.canvas.getContext("2d");
  }

  /**
   * Retrieves the current image data from the canvas.
   * @returns {ImageData} The image data object containing pixel information
   */
  getImageData() {
    return this.context.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Places the provided image data onto the canvas.
   * @param {ImageData} imageData - The image data to be drawn on the canvas
   */
  putImageData(imageData) {
    this.context.putImageData(imageData, 0, 0);
  }

  /**
   * Draws an image source onto the canvas with specified dimensions.
   * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} source - The source image to draw
   */
  drawImage(source) {
    this.context.drawImage(source, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Processes an image source through the filter pipeline.
   * Draws the image, gets its data, processes it, and updates the canvas.
   * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} source - The source image to process
   */
  process(source) {
    this.drawImage(source);
    const imageData = this.getImageData();
    this.processImageData(imageData);
    this.putImageData(imageData);
  }

  /**
   * Abstract method to be implemented by child classes for actual image processing.
   * @abstract
   * @param {ImageData} imageData - The image data to be processed
   * @throws {Error} If method is not implemented by child class
   */
  processImageData(imageData) {
    // To be implemented by child classes
    throw new Error("processImageData must be implemented by child classes");
  }
}
