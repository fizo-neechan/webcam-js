import { ImageFilter } from "./imageFilter.js";

/**
 * A filter class that applies threshold-based filtering on specific color channels of an image
 * @extends ImageFilter
 */
export class ChannelThresholdFilter extends ImageFilter {
  /**
   * Creates an instance of ChannelThresholdFilter
   * @param {string} canvasId - The ID of the canvas element to apply the filter to
   * @param {('red'|'green'|'blue')} channel - The color channel to apply the threshold filter to
   * @param {string} thresholdSliderId - The ID of the HTML slider element that controls the threshold value
   */
  constructor(canvasId, channel, thresholdSliderId) {
    super(canvasId);
    this.channel = channel;
    this.channelIndex = { red: 0, green: 1, blue: 2 }[channel];
    this.thresholdSlider = document.getElementById(thresholdSliderId);
  }

  /**
   * Processes the image data by applying a threshold filter to the specified color channel
   * The filter works by:
   * 1. Reading the threshold value from the slider
   * 2. For each pixel, checking if the specified channel value is above the threshold
   * 3. Setting the channel value to either 255 (white) or 0 (black) based on the threshold
   * 4. Setting other channels to 0 and alpha to 255
   *
   * @param {ImageData} imageData - The ImageData object containing the pixel data to process
   * @returns {void}
   */
  processImageData(imageData) {
    const data = imageData.data;
    const threshold = parseInt(this.thresholdSlider.value);

    for (let i = 0; i < data.length; i += 4) {
      const value = data[i + this.channelIndex] > threshold ? 255 : 0;
      data[i] = this.channel === "red" ? value : 0; // R
      data[i + 1] = this.channel === "green" ? value : 0; // G
      data[i + 2] = this.channel === "blue" ? value : 0; // B
      data[i + 3] = 255; // A
    }
  }
}
