// Initialize the application when the page loads
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
