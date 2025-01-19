import { ImageFilter } from './imageFilter.js';
import { FACE_DETECTION_MODEL_URL } from './constants.js';

/**
 * Class representing a face detection filter that extends ImageFilter.
 * This filter detects faces in images using the face-api.js library.
 */
export class FaceDetectionFilter extends ImageFilter {
  /**
   * Create a face detection filter.
   * @param {string} canvasId - The ID of the canvas element to render to.
   */
  constructor(canvasId) {
    super(canvasId);
    this.detections = [];
    this.loadModels();
  }

  /**
   * Loads the required face detection models from the specified URL.
   * Loads TinyFaceDetector, FaceLandmark68Net, and FaceRecognitionNet models.
   * @async
   * @throws {Error} Throws an error if models fail to load
   * @return {Promise<void>}
   */
  async loadModels() {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(FACE_DETECTION_MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(FACE_DETECTION_MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(FACE_DETECTION_MODEL_URL)
      ]);
      console.log('Face detection models loaded successfully');
    } catch (error) {
      throw new Error('Error loading face detection models:', error);
    }
  }

  /**
   * Processes the source image by drawing it and detecting faces.
   * @async
   * @param {HTMLImageElement|HTMLVideoElement} source - The source image/video to process
   * @return {Promise<void>}
   */
  async process(source) {
    this.drawImage(source);
    await this.detectFaces();
    this.drawDetections();
  }

  /**
   * Detects all faces in the current canvas image.
   * Uses TinyFaceDetector for face detection.
   * @async
   * @return {Promise<void>}
   */
  async detectFaces() {
    this.detections = await faceapi.detectAllFaces(
      this.canvas,
      new faceapi.TinyFaceDetectorOptions()
    );
  }

  /**
   * Draws rectangles around detected faces on the canvas.
   * Uses green color (#00ff00) with 2px line width.
   */
  drawDetections() {
    this.detections.forEach(detection => {
      const { x, y, width, height } = detection.box;
      this.context.strokeStyle = '#00ff00';
      this.context.lineWidth = 2;
      this.context.strokeRect(x, y, width, height);
    });
  }

  /**
   * Returns the current face detections.
   * @return {Array} Array of face detection results
   */
  getDetections() {
    return this.detections;
  }
}