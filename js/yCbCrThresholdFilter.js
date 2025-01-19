import { ImageFilter } from "./imageFilter.js";

/**
 * @class YCbCrThresholdFilter
 * @extends ImageFilter
 * @description A filter that applies threshold-based segmentation on the Y (luminance) component of YCbCr color space.
 * The filter converts pixels to black or white based on whether their luminance value exceeds the threshold.
 *
 * @param {string} canvasId - The ID of the canvas element where the filter will be applied
 * @param {string} thresholdSliderId - The ID of the HTML input slider element that controls the threshold value
 *
 * @property {HTMLElement} thresholdSlider - Reference to the DOM slider element that controls threshold
 */
export class YCbCrThresholdFilter extends ImageFilter {
  constructor(canvasId, thresholdSliderId) {
    super(canvasId);
    this.thresholdSlider = document.getElementById(thresholdSliderId);
  }

  /**
   * @method processImageData
   * @description Processes the image data by applying a threshold to the Y (luminance) component.
   * Pixels with luminance above the threshold become white (255), while those below become black (0).
   * The same value is applied to all RGB channels, effectively creating a binary image.
   *
   * @param {ImageData} imageData - The image data to process, containing pixel values in RGBA format
   * @param {Uint8ClampedArray} imageData.data - The pixel array where each pixel is represented by 4 consecutive values (R,G,B,A)
   *
   * @example
   * // Assuming filter is an instance of YCbCrThresholdFilter
   * const imageData = context.getImageData(0, 0, width, height);
   * filter.processImageData(imageData);
   */
  processImageData(imageData) {
    const data = imageData.data;
    const threshold = parseInt(this.thresholdSlider.value);

    for (let i = 0; i < data.length; i += 4) {
      // Get Y component (stored in red channel)
      const y = data[i];

      // Apply threshold to Y (luminance) component
      const value = y > threshold ? 255 : 0;
      data[i] = value; // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255; // A
    }
  }
}
