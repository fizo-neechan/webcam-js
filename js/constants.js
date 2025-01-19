/**
 * @fileoverview Constants used throughout the webcam project
 * @module constants
 * 
 * @constant {number} CANVAS_WIDTH - The width of the canvas in pixels (160px)
 * @constant {number} CANVAS_HEIGHT - The height of the canvas in pixels (120px)
 * 
 * @constant {string} FACE_DETECTION_MODEL_URL - URL to the face-api.js model weights
 * 
 * @constant {Object} RGB_TO_YCBCR - Coefficients for RGB to YCbCr color space conversion
 * @property {number} Y_R - Red coefficient for Y (luminance) component (0.299)
 * @property {number} Y_G - Green coefficient for Y (luminance) component (0.587)
 * @property {number} Y_B - Blue coefficient for Y (luminance) component (0.114)
 * @property {number} CB_R - Red coefficient for Cb (blue-difference chroma) component (-0.168736)
 * @property {number} CB_G - Green coefficient for Cb (blue-difference chroma) component (-0.331264)
 * @property {number} CB_B - Blue coefficient for Cb (blue-difference chroma) component (0.5)
 * @property {number} CR_R - Red coefficient for Cr (red-difference chroma) component (0.5)
 * @property {number} CR_G - Green coefficient for Cr (red-difference chroma) component (-0.418688)
 * @property {number} CR_B - Blue coefficient for Cr (red-difference chroma) component (-0.081312)
 * 
 * @constant {number} BLOCK_SIZE - Size of processing blocks in pixels (5px)
 * @constant {number} BLUR_RADIUS - Radius for blur effect in pixels (10px)
 */

export const CANVAS_WIDTH = 160;
export const CANVAS_HEIGHT = 120;

export const FACE_DETECTION_MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

export const RGB_TO_YCBCR = {
  Y_R: 0.299,
  Y_G: 0.587,
  Y_B: 0.114,
  CB_R: -0.168736,
  CB_G: -0.331264,
  CB_B: 0.5,
  CR_R: 0.5,
  CR_G: -0.418688,
  CR_B: -0.081312,
};

export const BLOCK_SIZE = 5;
export const BLUR_RADIUS = 10;