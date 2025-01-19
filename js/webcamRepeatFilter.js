import { ImageFilter } from "./imageFilter.js";

/**
 * @class WebcamRepeatFilter
 * @extends ImageFilter
 * @description A filter class that creates an exact copy of webcam frames without any image processing.
 * Useful as a base filter or for creating intermediate copies of the webcam stream.
 *
 * @param {string} canvasId - The ID of the canvas element where the webcam feed will be displayed
 */
export class WebcamRepeatFilter extends ImageFilter {
  constructor(canvasId) {
    super(canvasId);
  }

  /**
   * @method processImageData
   * @description Creates an exact copy of the input image data without any modifications.
   * This method is called for each frame of the webcam feed.
   * @param {ImageData} imageData - The raw image data from the webcam feed
   * @returns {ImageData} The unmodified image data
   */
  processImageData(imageData) {
    // No processing needed as we just want an exact copy
    return imageData;
  }

  /**
   * @method getContext
   * @description Provides access to the canvas rendering context.
   * Useful for other filters that need to perform direct canvas operations.
   * @returns {CanvasRenderingContext2D} The 2D rendering context of the canvas
   */
  getContext() {
    return this.context;
  }

  /**
   * @method getCurrentImageData
   * @description Retrieves the current image data from the canvas.
   * Useful for capturing the current state of the canvas for further processing.
   * @returns {ImageData} The current image data from the entire canvas
   */
  getCurrentImageData() {
    return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
}
