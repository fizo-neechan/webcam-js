import { ImageFilter } from "./imageFilter.js";

/**
 * @class GrayScaleFilter
 * @extends ImageFilter
 * @description A filter class that converts an image to grayscale and applies optional brightness adjustment
 *
 * @param {string} canvasId - The ID of the canvas element to apply the filter to
 * @param {number} [brightnessIncrease=1.2] - Brightness multiplier to adjust the intensity of the grayscale values
 *                                            Values > 1 increase brightness, values < 1 decrease brightness
 *
 * @example
 * // Create a new grayscale filter with default brightness
 * const filter = new GrayScaleFilter('myCanvas');
 *
 * // Create a grayscale filter with custom brightness
 * const brighterFilter = new GrayScaleFilter('myCanvas', 1.5);
 */
export class GrayScaleFilter extends ImageFilter {
  constructor(canvasId, brightnessIncrease = 1.2) {
    super(canvasId);
    this.brightnessIncrease = brightnessIncrease;
  }

  /**
   * @method processImageData
   * @description Processes the image data by converting RGB values to grayscale and applying brightness adjustment
   * @param {ImageData} imageData - The ImageData object containing the pixel data of the image
   *
   * @details
   * The conversion to grayscale is done by averaging the R, G, and B values for each pixel.
   * The brightness adjustment is applied after the grayscale conversion.
   * The final values are clamped to the valid range of 0-255.
   *
   * The formula used is:
   * gray = (R + G + B) / 3
   * final = min(gray * brightnessIncrease, 255)
   */
  processImageData(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const brightened = Math.min(gray * this.brightnessIncrease, 255);

      data[i] = brightened; // R
      data[i + 1] = brightened; // G
      data[i + 2] = brightened; // B
    }
  }
}
