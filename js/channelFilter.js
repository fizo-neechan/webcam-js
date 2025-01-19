import { ImageFilter } from "./imageFilter.js";

/**
 * @class ChannelFilter
 * @extends ImageFilter
 * @description A filter that isolates a specific color channel (red, green, or blue) from an image,
 * setting all other channels to zero. This creates a monochromatic image showing only the selected color component.
 *
 * @param {string} canvasId - The ID of the canvas element where the filter will be applied
 * @param {('red'|'green'|'blue')} channel - The color channel to isolate
 *
 * @property {string} channel - Stores the selected color channel ('red', 'green', or 'blue')
 * @property {number} channelIndex - Maps the channel name to its corresponding index in the pixel data array (0 for red, 1 for green, 2 for blue)
 *
 */
export class ChannelFilter extends ImageFilter {
  constructor(canvasId, channel) {
    super(canvasId);
    this.channel = channel; // 'red', 'green', or 'blue'
    this.channelIndex = { red: 0, green: 1, blue: 2 }[channel];
  }

  /**
   * @method processImageData
   * @param {ImageData} imageData - The pixel data of the image to be processed
   * @description Processes the image data by:
   * 1. Iterating through each pixel (4 bytes per pixel: R,G,B,A)
   * 2. Getting the value of the selected channel for the current pixel
   * 3. Setting the selected channel to its original value while zeroing out other channels
   * 4. Preserving the alpha channel
   */
  processImageData(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = data[i + this.channelIndex];
      data[i] = this.channel === "red" ? value : 0; // R
      data[i + 1] = this.channel === "green" ? value : 0; // G
      data[i + 2] = this.channel === "blue" ? value : 0; // B
    }
  }
}
