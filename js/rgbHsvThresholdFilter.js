import { ImageFilter } from "./imageFilter.js";
import { RgbHsvFilter } from "./rgbHsvFilter.js";

/**
 * @class RgbHsvThresholdFilter
 * @extends ImageFilter
 * @description A filter that applies threshold-based filtering on HSV color space.
 * The filter processes image data by comparing the Value (V) component of HSV color space
 * against a user-defined threshold value. Pixels with V values above the threshold retain
 * their colors (converted back from HSV to RGB), while pixels below the threshold are set to black.
 *
 * @param {string} canvasId - The ID of the canvas element to apply the filter to
 * @param {string} thresholdSliderId - The ID of the input slider element that controls the threshold value
 *
 * @property {HTMLElement} thresholdSlider - Reference to the threshold slider DOM element
 */
export class RgbHsvThresholdFilter extends ImageFilter {
  constructor(canvasId, thresholdSliderId) {
    super(canvasId);
    this.thresholdSlider = document.getElementById(thresholdSliderId);
  }

  /**
   * @method processImageData
   * @description Processes the image data by applying HSV threshold filtering.
   * For each pixel, if its V value is above the threshold, the HSV values are
   * converted back to RGB. If below threshold, the pixel is set to black.
   * The alpha channel is always set to fully opaque (255).
   *
   * @param {ImageData} imageData - The image data to process
   * @param {Uint8ClampedArray} imageData.data - The array containing pixel data
   *
   * @example
   * const filter = new RgbHsvThresholdFilter('myCanvas', 'thresholdSlider');
   * filter.processImageData(ctx.getImageData(0, 0, width, height));
   */
  processImageData(imageData) {
    const data = imageData.data;
    const threshold = parseInt(this.thresholdSlider.value);

    for (let i = 0; i < data.length; i += 4) {
      const h = data[i]; // H from R channel
      const s = data[i + 1]; // S from G channel
      const v = data[i + 2]; // V from B channel

      if (v > threshold) {
        // If above threshold, convert HSV back to RGB
        const rgb = RgbHsvFilter.hsvToRgb(h, s, v);
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
      } else {
        // If below threshold, set to black
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
      }
      data[i + 3] = 255; // Alpha channel
    }
  }
}
