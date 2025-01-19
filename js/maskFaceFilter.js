import { ImageFilter } from "./imageFilter.js";
import { BLOCK_SIZE, BLUR_RADIUS } from "./constants.js";

/**
 * Class representing a face filter that applies various masking effects to detected faces.
 * Extends the base ImageFilter class to provide specific face masking functionality.
 * @extends ImageFilter
 */
export class MaskFaceFilter extends ImageFilter {
  /**
   * Creates a new MaskFaceFilter instance.
   * @param {string} canvasId - The ID of the canvas element to apply filters to.
   */
  constructor(canvasId) {
    super(canvasId);
    this.effectHandlers = {
      grayscale: this.applyGrayscaleMask.bind(this),
      blur: this.applyBlurMask.bind(this),
      pixelate: this.applyPixelateMask.bind(this),
      ycbcr: this.applyYCbCrMask.bind(this),
    };
  }

  /**
   * Applies the specified effect to a face region.
   * @param {string} effect - The name of the effect to apply ('grayscale', 'blur', 'pixelate', or 'ycbcr').
   * @param {Object} faceRegion - The region coordinates and dimensions of the detected face.
   * @param {HTMLCanvasElement} sourceCanvas - The source canvas containing the original image.
   */
  applyEffect(effect, faceRegion, sourceCanvas) {
    const handler = this.effectHandlers[effect];
    if (handler) {
      handler(faceRegion, sourceCanvas);
    }
  }

  /**
   * Applies a grayscale effect to the face region by averaging RGB values.
   * Each pixel's RGB channels are set to the average of their original values.
   * @param {Object} faceRegion - The region coordinates and dimensions of the detected face.
   * @param {HTMLCanvasElement} sourceCanvas - The source canvas containing the original image.
   */
  applyGrayscaleMask(faceRegion, sourceCanvas) {
    const imageData = this.getRegionImageData(faceRegion, sourceCanvas);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    this.putRegionImageData(imageData, faceRegion);
  }

  /**
   * Applies a blur effect to the face region using a temporary canvas.
   * Uses CSS blur filter with a predefined radius (BLUR_RADIUS).
   * @param {Object} faceRegion - The region coordinates and dimensions of the detected face.
   * @param {HTMLCanvasElement} sourceCanvas - The source canvas containing the original image.
   */
  applyBlurMask(faceRegion, sourceCanvas) {
    this.context.filter = `blur(${BLUR_RADIUS}px)`;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = faceRegion.width;
    tempCanvas.height = faceRegion.height;
    const tempCtx = tempCanvas.getContext("2d");

    // Draw the face region from source canvas to temp canvas
    tempCtx.drawImage(
      sourceCanvas,
      faceRegion.x,
      faceRegion.y,
      faceRegion.width,
      faceRegion.height,
      0,
      0,
      faceRegion.width,
      faceRegion.height
    );

    // Apply blur
    this.context.filter = "none";
    this.context.clearRect(faceRegion.x, faceRegion.y, faceRegion.width, faceRegion.height);
    this.context.drawImage(
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

  /**
   * Applies a pixelation effect to the face region by creating larger color blocks.
   * Divides the region into blocks of size BLOCK_SIZE and fills each with average color.
   * @param {Object} faceRegion - The region coordinates and dimensions of the detected face.
   * @param {HTMLCanvasElement} sourceCanvas - The source canvas containing the original image.
   */
  applyPixelateMask(faceRegion, sourceCanvas) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = faceRegion.width;
    tempCanvas.height = faceRegion.height;
    const tempCtx = tempCanvas.getContext("2d");

    // Draw face region from source canvas to temp canvas
    tempCtx.drawImage(
      sourceCanvas,
      faceRegion.x,
      faceRegion.y,
      faceRegion.width,
      faceRegion.height,
      0,
      0,
      faceRegion.width,
      faceRegion.height
    );

    // Process blocks
    for (let y = 0; y < faceRegion.height; y += BLOCK_SIZE) {
      for (let x = 0; x < faceRegion.width; x += BLOCK_SIZE) {
        const blockWidth = Math.min(BLOCK_SIZE, faceRegion.width - x);
        const blockHeight = Math.min(BLOCK_SIZE, faceRegion.height - y);

        const blockData = tempCtx.getImageData(x, y, blockWidth, blockHeight);
        const avgColor = this.calculateAverageColor(blockData.data);

        tempCtx.fillStyle = `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`;
        tempCtx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
      }
    }

    // Draw pixelated result back
    this.context.drawImage(
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

  /**
   * Converts the face region to YCbCr color space from RGB.
   * Y (luminance), Cb (blue-difference), Cr (red-difference) components are calculated
   * using standard conversion formulas.
   * @param {Object} faceRegion - The region coordinates and dimensions of the detected face.
   * @param {HTMLCanvasElement} sourceCanvas - The source canvas containing the original image.
   */
  applyYCbCrMask(faceRegion, sourceCanvas) {
    const imageData = this.getRegionImageData(faceRegion, sourceCanvas);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      data[i] = y;
      data[i + 1] = cb;
      data[i + 2] = cr;
    }

    this.putRegionImageData(imageData, faceRegion);
  }

  /**
   * Retrieves the image data for a specific region from the source canvas.
   * @param {Object} region - The region coordinates and dimensions to get data from.
   * @param {HTMLCanvasElement} sourceCanvas - The source canvas containing the original image.
   * @returns {ImageData} The image data for the specified region.
   */
  getRegionImageData(region, sourceCanvas) {
    const ctx = sourceCanvas.getContext("2d");
    return ctx.getImageData(region.x, region.y, region.width, region.height);
  }

  /**
   * Puts the modified image data back onto the canvas at the specified region.
   * @param {ImageData} imageData - The modified image data to put back.
   * @param {Object} region - The region coordinates and dimensions where to put the data.
   */
  putRegionImageData(imageData, region) {
    this.context.putImageData(imageData, region.x, region.y);
  }

  /**
   * Calculates the average RGB color values for a set of pixels.
   * @param {Uint8ClampedArray} data - The pixel data array containing RGBA values.
   * @returns {Object} An object containing the average r, g, b values.
   */
  calculateAverageColor(data) {
    let sumR = 0,
      sumG = 0,
      sumB = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      sumR += data[i];
      sumG += data[i + 1];
      sumB += data[i + 2];
      count++;
    }

    return {
      r: Math.round(sumR / count),
      g: Math.round(sumG / count),
      b: Math.round(sumB / count),
    };
  }
}
