import { ImageProcessorApp } from "./app.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants.js";

/**
 * @class ImageProcessing
 * @description Handles initialization and setup of image processing functionality including canvas management, keyboard shortcuts, and error handling
 *
 * @property {ImageProcessorApp} app - Instance of the ImageProcessorApp class for handling image processing operations
 *
 * @example
 * const imageProcessor = new ImageProcessing();
 */
class ImageProcessing {
  /**
   * @constructor
   * @description Initializes the ImageProcessing class and checks for DOM loading before setup
   */
  constructor() {
    // Initialize the application when DOM is loaded
    this.checkDOMLoaded().then(() => {
      this.initializeApp();
    });
  }

  /**
   * @method checkDOMLoaded
   * @async
   * @description Ensures the DOM is fully loaded before initializing the application
   * @returns {Promise<void>} Resolves when DOM is loaded
   */
  async checkDOMLoaded() {
    return new Promise((resolve) => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * @method initializeApp
   * @description Initializes the main application components including ImageProcessorApp instance, resize observer, and keyboard shortcuts
   * @throws {Error} If initialization fails
   */
  initializeApp() {
    try {
      // Create instance of ImageProcessorApp
      this.app = new ImageProcessorApp();

      // Set up resize observer for responsive canvas sizing
      this.setupResizeObserver();

      // Set up keyboard shortcuts info
      this.setupKeyboardShortcuts();

      console.log("Image Processing Demo initialized successfully");
    } catch (error) {
      console.error("Error initializing Image Processing Demo:", error);
      this.showErrorMessage("Failed to initialize the application. Please check console for details.");
    }
  }

  /**
   * @method setupResizeObserver
   * @description Sets up a ResizeObserver to monitor canvas container size changes and adjust layout accordingly
   * @see adjustCanvasLayout
   */
  setupResizeObserver() {
    const canvasContainer = document.querySelector(".canvas-container");
    if (canvasContainer) {
      const resizeObserver = new ResizeObserver(() => {
        this.adjustCanvasLayout();
      });
      resizeObserver.observe(canvasContainer);
    }
  }

  /**
   * @method adjustCanvasLayout
   * @description Adjusts canvas sizes and layout based on container width for responsive design
   * @requires CANVAS_HEIGHT and CANVAS_WIDTH constants to be defined
   */
  adjustCanvasLayout() {
    const container = document.querySelector(".canvas-container");
    const canvases = document.querySelectorAll("canvas");
    const containerWidth = container.clientWidth;

    // Calculate optimal number of columns based on container width
    const numColumns = Math.max(1, Math.floor(containerWidth / 200));
    container.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;

    // Adjust canvas sizes proportionally
    canvases.forEach((canvas) => {
      const ratio = CANVAS_HEIGHT / CANVAS_WIDTH;
      const width = Math.min(200, containerWidth / numColumns - 20);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${width * ratio}px`;
    });
  }

  /**
   * @method setupKeyboardShortcuts
   * @description Creates and displays keyboard shortcut information and sets up event listeners for keyboard controls
   * @example
   * // Keyboard shortcuts:
   * // 1: Grayscale effect
   * // 2: Blur effect
   * // 3: YCbCr effect
   * // 4: Pixelation effect
   * // C: Capture frame
   * // S: Start/Stop camera
   */
  setupKeyboardShortcuts() {
    const shortcuts = [
      { key: "1", description: "Apply grayscale effect to detected face" },
      { key: "2", description: "Apply blur effect to detected face" },
      { key: "3", description: "Apply YCbCr effect to detected face" },
      { key: "4", description: "Apply pixelation effect to detected face" },
      { key: "C", description: "Capture and process current frame" },
      { key: "S", description: "Start/Stop camera" },
    ];

    // Create keyboard shortcuts info element
    const shortcutsDiv = document.createElement("div");
    shortcutsDiv.className = "shortcuts-info";
    shortcutsDiv.innerHTML = `
            <h3>Keyboard Shortcuts</h3>
            <ul>
                ${shortcuts.map((s) => `<li><kbd>${s.key}</kbd>: ${s.description}</li>`).join("")}
            </ul>
        `;

    // Add to document
    document.querySelector(".controls").appendChild(shortcutsDiv);

    // Add global keyboard handlers
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "c") {
        document.getElementById("captureImage").click();
      } else if (e.key.toLowerCase() === "s") {
        document.getElementById("startCamera").click();
      }
    });
  }

  /**
   * @method showErrorMessage
   * @description Displays an error message to the user by creating and inserting an error div
   * @param {string} message - The error message to display
   */
  showErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    document.body.insertBefore(errorDiv, document.body.firstChild);
  }
}

// Initialize the application
new ImageProcessing();
