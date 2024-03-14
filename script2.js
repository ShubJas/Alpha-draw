document.addEventListener('DOMContentLoaded', function () {
    const letterImage = document.getElementById('letter-image');
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let currentLetterIndex = 0;
    document.getElementById('undo-button').addEventListener('click', function () {
        undo();
    });

    document.getElementById('redo-button').addEventListener('click', function () {
        redo();
    });

    document.getElementById('check-drawing').addEventListener('click', checkDrawing);


    // Setup the background and drawing canvases
    const backgroundCanvas = document.createElement('canvas');
    const drawingCanvas = document.getElementById('letter-canvas');
    const backgroundCtx = backgroundCanvas.getContext('2d');
    const drawingCtx = drawingCanvas.getContext('2d');
    const canvasContainer = document.getElementById('drawing-area');

    // Adjust styles for backgroundCanvas to ensure it covers the same area as drawingCanvas
    backgroundCanvas.width = drawingCanvas.width;
    backgroundCanvas.height = drawingCanvas.height;
    backgroundCanvas.style.position = 'absolute';
    drawingCanvas.style.position = 'absolute';

    // Insert the background canvas into the canvas container
    canvasContainer.style.position = 'relative';
    canvasContainer.insertBefore(backgroundCanvas, drawingCanvas);

    let drawing = false;
    let currentColor = '#000000';
    let lineWidth = 5; // Default line width for drawing
    let eraserActive = false;
    let eraserLineWidth = 30; // Larger line width for erasing

    // Function to update the letter display and background canvas
    function displayLetter() {
        letterImage.src = `images/${letters[currentLetterIndex]}.png`;
        letterImage.alt = `The letter ${letters[currentLetterIndex]}`;
        updateBackgroundCanvas(currentLetterIndex);
    }

    window.navigateLetter = function (step) {
        currentLetterIndex += step;
        if (currentLetterIndex < 0) {
            currentLetterIndex = letters.length - 1;
        } else if (currentLetterIndex >= letters.length) {
            currentLetterIndex = 0;
        }
        displayLetter(); // Update the letter image
        updateBackgroundCanvas(currentLetterIndex); // Update the background canvas
    };


    function checkDrawing() {
        // Clear the canvas or create a temporary canvas layer for debugging
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    
        // Draw the predefined path for the current letter
        drawPredefinedPath(letters[currentLetterIndex]);
    
        // Draw user's points as small circles on the canvas
        userDrawnPoints.forEach(point => {
            // Assuming point.x and point.y are normalized, scale them up
            const x = point.x * drawingCanvas.width;
            const y = point.y * drawingCanvas.height;
    
            drawingCtx.fillStyle = 'blue'; // Blue color for user's points
            drawingCtx.beginPath();
            drawingCtx.arc(x, y, 3, 0, Math.PI * 2); // Small circle for each point
            drawingCtx.fill();
        });
    
        // Calculate the match percentage
        const matchPercentage = compareDrawingToPath(userDrawnPoints, letters[currentLetterIndex]);
        alert(`Your drawing is ${matchPercentage.toFixed(2)}% accurate to the letter '${letters[currentLetterIndex]}'.`);
    
        // Clear the points after checking
        userDrawnPoints = [];
    }
    
    // Drawing functions
    function startDrawing(e) {
        drawing = true;
        draw(e);
    }

    function stopDrawing() {
        drawing = false;
        drawingCtx.beginPath();
    }

    let undoStack = []; // Stack to keep track of each state for undo
    let redoStack = []; // Stack to keep track of each state for redo

    function saveState(canvas, stack, keepRedo = false) {
        keepRedo ? null : redoStack.length = 0; // Clear redoStack if we are not keeping the redo history
        stack.push(canvas.toDataURL()); // Save the current state of the canvas
    }

    function undoRedoAction(stack1, stack2) {
        if (stack1.length) {
            const restoreState = stack1.pop(); // Get the last state from stack
            const img = new Image();
            img.src = restoreState;
            img.onload = function () {
                stack2.push(drawingCanvas.toDataURL()); // Save the current state for possible redo
                drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); // Clear the canvas
                drawingCtx.drawImage(img, 0, 0); // Draw the previous state
            };
        }
    }

    // Function to play the letter sound
    window.playLetterSound = function () {
        const currentLetter = letters[currentLetterIndex]; // Get the current letter
        const audioPath = `audio/${currentLetter}.mp3`; // Construct the path to the audio file
        const audio = new Audio(audioPath);
        audio.play(); // Play the audio file
    };

    window.undo = function () {
        if (undoStack.length > 0) {
            const lastState = undoStack.pop();
            redoStack.push(drawingCanvas.toDataURL()); // Save current state before undo
            restoreState(lastState);
        }
    };

    window.redo = function () {
        if (redoStack.length > 0) {
            const nextState = redoStack.pop();
            undoStack.push(drawingCanvas.toDataURL()); // Save current state before redo
            restoreState(nextState);
        }
    };

    function restoreState(dataURL) {
        const img = new Image();
        img.onload = function () {
            drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            drawingCtx.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height);
        };
        img.src = dataURL;
    }


    // Change drawing color
    window.changeColor = function (color) {
        eraserActive = false;
        currentColor = color;
        drawingCtx.globalCompositeOperation = 'source-over';
        lineWidth = 5;
    };

    // Activate eraser
    window.activateEraser = function () {
        eraserActive = true;
        drawingCtx.globalCompositeOperation = 'destination-out';
        lineWidth = eraserLineWidth;
    };

    // Clear the drawing canvas
    window.clearCanvas = function () {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    };

    let userDrawnPoints = []; // Array to store the user's drawn points

    function normalizeCoordinates(point, canvas) {
        return {
            x: point.x / canvas.width,
            y: point.y / canvas.height
        };
    }


    // Modify the draw function to capture points
    function draw(e) {
        if (!drawing) return;

        const rect = drawingCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / (rect.right - rect.left) * drawingCanvas.width;
        const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * drawingCanvas.height;

        // Normalize and store the point
        const normalizedPoint = normalizeCoordinates({ x, y }, drawingCanvas);
        userDrawnPoints.push(normalizedPoint);

        drawingCtx.lineWidth = lineWidth;
        drawingCtx.lineCap = 'round';
        drawingCtx.strokeStyle = currentColor;

        drawingCtx.lineTo(x, y);
        drawingCtx.stroke();
        drawingCtx.beginPath();
        drawingCtx.moveTo(x, y);
    }


    // Reset userDrawingPath when starting a new drawing or when needed
    function startDrawing(e) {
        drawing = true;
        userDrawingPath = []; // Clear the path at the start of a new drawing
        draw(e);
    }





    // Initialize and resize canvas
    function resizeCanvases() {
        // Adjust the canvas sizes and redraw the background
        backgroundCanvas.width = canvasContainer.offsetWidth;
        backgroundCanvas.height = canvasContainer.offsetHeight;
        drawingCanvas.width = canvasContainer.offsetWidth;
        drawingCanvas.height = canvasContainer.offsetHeight;

        updateBackgroundCanvas(currentLetterIndex);
    }

    window.addEventListener('resize', resizeCanvases);

    function updateBackgroundCanvas(letterIndex) {
        // Clear the background canvas before drawing the new letter
        backgroundCanvas.width = canvasContainer.offsetWidth; // This line clears the canvas
        backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height); // Clear for good measure

        drawGrid(backgroundCtx); // Redraw the grid
        drawLetter(backgroundCtx, letters[letterIndex]); // Draw the new letter
    }

    const predefinedLetterPaths = {
        'A': [
          // Bottom left to top middle
          { x: 0.1, y: 0.9 },
          { x: 0.2, y: 0.7 },
          { x: 0.3, y: 0.5 },
          { x: 0.4, y: 0.3 },
          { x: 0.5, y: 0.1 },
          // Top middle to bottom right
          { x: 0.6, y: 0.3 },
          { x: 0.7, y: 0.5 },
          { x: 0.8, y: 0.7 },
          { x: 0.9, y: 0.9 },
          // Crossbar left to right
          { x: 0.3, y: 0.5 },
          { x: 0.4, y: 0.5 },
          { x: 0.5, y: 0.5 },
          { x: 0.6, y: 0.5 },
          { x: 0.7, y: 0.5 }
        ],
        // ...definitions for other letters
      };


    // Example function to draw the predefined path for debugging/visualization
    function drawPredefinedPath(letter) {
        const path = predefinedLetterPaths[letter];
        if (!path) return;
    
        drawingCtx.strokeStyle = 'red'; // Red color for the predefined path
        drawingCtx.beginPath();
        drawingCtx.moveTo(path[0].x * drawingCanvas.width, path[0].y * drawingCanvas.height);
        for (let i = 1; i < path.length; i++) {
            drawingCtx.lineTo(path[i].x * drawingCanvas.width, path[i].y * drawingCanvas.height);
        }
        drawingCtx.stroke();
    }
    

    // Optionally call drawPredefinedPath during initialization or upon letter change
    // drawPredefinedPath('A'); // Uncomment to see the path for letter 'A' drawn on the canvas

    // Function to calculate distance between two points
    function distanceBetween(point1, point2) {
        return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
    }

    function compareDrawingToPath(userDrawnPoints, letter) {
        const predefinedPath = predefinedLetterPaths[letter];
        if (!predefinedPath || userDrawnPoints.length === 0) return 0;

        let closePoints = 0;
        const tolerance = 0.05 ; // Adjust based on your normalization scale, now defined

        userDrawnPoints.forEach(drawnPoint => {
            const isCloseToPoint = predefinedPath.some(predefinedPoint => {
                const distance = Math.sqrt(Math.pow(drawnPoint.x - predefinedPoint.x, 2) + Math.pow(drawnPoint.y - predefinedPoint.y, 2));
                return distance <= tolerance;
            });

            if (isCloseToPoint) closePoints++;
        });

        const matchPercentage = (closePoints / userDrawnPoints.length) * 100;
        return matchPercentage;
    }


    
    







    // Example usage
    // Assuming userDrawnPoints is filled with the user's drawing points
    const matchPercentage = compareDrawingToPath(userDrawnPoints, 'A');
    console.log(`Match Percentage: ${matchPercentage}%`);


    function highlightDeviation(deviationPoints) {
        deviationPoints.forEach(point => {
            drawingCtx.fillStyle = 'red'; // Color for highlighting deviation
            drawingCtx.beginPath();
            drawingCtx.arc(point.x, point.y, 5, 0, 2 * Math.PI); // Draw a small circle
            drawingCtx.fill();
        });
    }

    function provideFeedback(matchPercentage, deviationPoints) {
        let feedbackMessage = `Your drawing is ${matchPercentage.toFixed(2)}% accurate. `;

        if (matchPercentage < 70) { // Assuming less than 70% is considered needing improvement
            feedbackMessage += "Try to follow the lines more closely. Focus on smooth, continuous strokes.";
            highlightDeviation(deviationPoints); // Visually show where to improve
        } else {
            feedbackMessage += "Great job! Keep practicing to improve even more.";
        }

        // Display feedback in a more engaging way than alert, e.g., a modal or a dedicated feedback area on the page
        displayFeedback(feedbackMessage);
    }


    function drawGrid(ctx) {
        const gridSize = 50;
        ctx.beginPath();
        for (let x = 0; x <= ctx.canvas.width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height);
        }
        for (let y = 0; y <= ctx.canvas.height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y);
        }
        ctx.strokeStyle = '#e0e0e0';
        ctx.stroke();
    }

    function drawLetter(ctx, letter) {
        ctx.globalAlpha = 0.2;
        ctx.font = '180px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.globalAlpha = 1;
    }

    drawingCanvas.addEventListener('mousedown', startDrawing);
    drawingCanvas.addEventListener('mouseup', stopDrawing);
    drawingCanvas.addEventListener('mousemove', draw);
    drawingCanvas.addEventListener('mouseleave', stopDrawing);


    drawingCanvas.addEventListener('mouseup', function () {
        saveState(drawingCanvas, undoStack); // Save the state when the drawing ends
    });

    saveState(drawingCanvas, undoStack);
    // Initial setup
    resizeCanvases();
    displayLetter();
});
