import { ImageFilter } from "./imageFilter.js";

/**
 * @class RgbHsvFilter
 * @extends ImageFilter
 * @description A filter that converts RGB color space to HSV (Hue, Saturation, Value) color space
 * and stores the HSV components in the RGB channels for visualization purposes.
 */
export class RgbHsvFilter extends ImageFilter {
  /**
   * @method processImageData
   * @param {ImageData} imageData - The image data object containing RGBA values
   * @description Processes the image data by converting RGB values to HSV color space.
   * The conversion is done by:
   * 1. Normalizing RGB values to range [0,1]
   * 2. Computing HSV components using color space conversion formulas
   * 3. Storing HSV values back in RGB channels:
   *    - Hue is stored in Red channel (normalized from 360° to 255)
   *    - Saturation is stored in Green channel (0-255)
   *    - Value is stored in Blue channel (0-255)
   */
  processImageData(imageData) {
    const data = imageData.data;

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

      // Store HSV components in RGB channels for visualization
      data[i] = (h * 255) / 360; // H in R channel
      data[i + 1] = s * 255; // S in G channel
      data[i + 2] = v * 255; // V in B channel
    }
  }

  /**
   * @method hsvToRgb
   * @static
   * @param {number} h - Hue value (0-255)
   * @param {number} s - Saturation value (0-255)
   * @param {number} v - Value/Brightness value (0-255)
   * @returns {Object} RGB color object with properties r, g, b (each 0-255)
   * @description Converts HSV color values back to RGB color space.
   * The conversion process:
   * 1. Denormalizes input values (h to 360°, s and v to range [0,1])
   * 2. Uses the HSV to RGB conversion algorithm based on color wheel sectors
   * 3. Returns an object with RGB components normalized to 0-255 range
   */
  static hsvToRgb(h, s, v) {
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

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }
}
