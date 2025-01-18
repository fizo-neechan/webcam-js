/**
 * @file main.js
 * @description This script initializes the ImageProcessor application and loads face detection models on window load.
 */


/**
 * Initializes the ImageProcessor application and loads face detection models.
 * @async
 * @function
 * @throws Will throw an error if the application fails to initialize.
 */
window.addEventListener("load", async () => {
  try {
    const app = new ImageProcessor();
    console.log("Starting application...");
    await app.loadFaceDetectionModels();
    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Error initializing application:", error);
  }
});
