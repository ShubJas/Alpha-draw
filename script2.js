document.addEventListener('DOMContentLoaded', function () {
    const letterImage = document.getElementById('letter-image');
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let currentLetterIndex = 0;
    document.getElementById('undo-button').addEventListener('click', function() {
        undo();
    });

    document.getElementById('redo-button').addEventListener('click', function() {
        redo();
    });
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
    window.playLetterSound = function() {
        const currentLetter = letters[currentLetterIndex]; // Get the current letter
        const audioPath = `audio/${currentLetter}.mp3`; // Construct the path to the audio file
        const audio = new Audio(audioPath);
        audio.play(); // Play the audio file
    };
    
    window.undo = function() {
        if (undoStack.length > 0) {
            const lastState = undoStack.pop();
            redoStack.push(drawingCanvas.toDataURL()); // Save current state before undo
            restoreState(lastState);
        }
    };
    
    window.redo = function() {
        if (redoStack.length > 0) {
            const nextState = redoStack.pop();
            undoStack.push(drawingCanvas.toDataURL()); // Save current state before redo
            restoreState(nextState);
        }
    };
    
    function restoreState(dataURL) {
        const img = new Image();
        img.onload = function() {
            drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            drawingCtx.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height);
        };
        img.src = dataURL;
    }
    

    // Change drawing color
    window.changeColor = function(color) {
        eraserActive = false;
        currentColor = color;
        drawingCtx.globalCompositeOperation = 'source-over';
        lineWidth = 5;
    };

    // Activate eraser
    window.activateEraser = function() {
        eraserActive = true;
        drawingCtx.globalCompositeOperation = 'destination-out';
        lineWidth = eraserLineWidth;
    };

    // Clear the drawing canvas
    window.clearCanvas = function() {
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    };

    // Drawing event
    function draw(e) {
        if (!drawing) return;

        const rect = drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        drawingCtx.lineWidth = lineWidth;
        drawingCtx.lineCap = 'round';
        drawingCtx.strokeStyle = currentColor;

        drawingCtx.lineTo(x, y);
        drawingCtx.stroke();
        drawingCtx.beginPath();
        drawingCtx.moveTo(x, y);
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

    drawingCanvas.addEventListener('mouseup', function() {
        saveState(drawingCanvas, undoStack); // Save the state when the drawing ends
    });

    saveState(drawingCanvas, undoStack);
    // Initial setup
    resizeCanvases();
    displayLetter();
});
