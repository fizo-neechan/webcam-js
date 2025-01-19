import { ImageFilter } from "./imageFilter.js";
import { RGB_TO_YCBCR } from "./constants.js";

/**
 * A filter class that converts RGB color space to YCbCr color space.
 * YCbCr is a way of encoding RGB color information that separates the luminance (Y)
 * from the chrominance components (Cb, Cr).
 *
 * Y (Luminance) - represents the brightness of a pixel
 * Cb (Blue Difference) - represents the difference between the blue component and a reference value
 * Cr (Red Difference) - represents the difference between the red component and a reference value
 *
 * @extends ImageFilter
 */
export class YCbCrFilter extends ImageFilter {
  /**
   * Processes image data by converting RGB values to YCbCr color space
   * The conversion uses standard RGB to YCbCr transformation matrix coefficients
   *
   * @param {ImageData} imageData - The image data to process, containing RGBA values
   * @returns {void}
   *
   * Formula used:
   * Y  =  0.299R + 0.587G + 0.114B
   * Cb = -0.169R - 0.331G + 0.500B + 128
   * Cr =  0.500R - 0.419G - 0.081B + 128
   *
   * The resulting YCbCr values are stored in the RGB channels of the image data:
   * - Y  is stored in the R channel
   * - Cb is stored in the G channel
   * - Cr is stored in the B channel
   * Alpha channel remains unchanged
   */
  processImageData(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const y = RGB_TO_YCBCR.Y_R * r + RGB_TO_YCBCR.Y_G * g + RGB_TO_YCBCR.Y_B * b;
      const cb = 128 + RGB_TO_YCBCR.CB_R * r + RGB_TO_YCBCR.CB_G * g + RGB_TO_YCBCR.CB_B * b;
      const cr = 128 + RGB_TO_YCBCR.CR_R * r + RGB_TO_YCBCR.CR_G * g + RGB_TO_YCBCR.CR_B * b;

      data[i] = y; // Store Y in R channel
      data[i + 1] = cb; // Store Cb in G channel
      data[i + 2] = cr; // Store Cr in B channel
    }
  }
}
