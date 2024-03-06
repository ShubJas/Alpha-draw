document.addEventListener('DOMContentLoaded', function () {
    const letterImage = document.getElementById('letter-image');
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let currentLetterIndex = 0;
    
    
    function displayLetter() {
        letterImage.src = `images/${letters[currentLetterIndex]}.png`; // Ensure the path matches where you've stored your images
        letterImage.alt = `The letter ${letters[currentLetterIndex]}`;
    }

    // Adjusted to access and modify only the image properties
    window.navigateLetter = function (step) {
        currentLetterIndex += step;
        if (currentLetterIndex < 0) {
            currentLetterIndex = letters.length - 1;
        } else if (currentLetterIndex >= letters.length) {
            currentLetterIndex = 0;
        }
        displayLetter();
    };

    displayLetter(); // Initial call to display the first letter and image

    const canvas = document.getElementById('letter-canvas');
    const ctx = canvas.getContext('2d');

    let drawing = false;

    function startDrawing(e) {
        drawing = true;
        draw(e); // Start drawing where the mouse is
    }

    function stopDrawing() {
        drawing = false;
        ctx.beginPath(); // Begin a new path for the next drawing segment
    }

    let currentColor = '#000000';
    let eraserActive = false;

    let drawingLineWidth = 5; // Default line width for drawing
    let eraserLineWidth = 30; // Larger line width for erasing

    function changeColor(color) {
        eraserActive = false; // Deactivate eraser mode
        currentColor = color;
        ctx.lineWidth = drawingLineWidth; // Apply drawing line width
        ctx.globalCompositeOperation = 'source-over'; // Default drawing mode
        ctx.beginPath(); // Start a new path for color drawing
    }

    function draw(e) {
        if (!drawing) return;
    
        const rect = canvas.getBoundingClientRect(); // Get the canvas position and size
        const x = e.clientX - rect.left; // Mouse x-coordinate relative to the canvas
        const y = e.clientY - rect.top; // Mouse y-coordinate relative to the canvas
    
        // Removed the line that sets ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = currentColor; // Use the global currentColor
    
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    



    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', stopDrawing); // Stop drawing when the mouse leaves the canvas

    // Call to set up the canvas drawing for the first time
    setupCanvas();

    function setupCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (eraserActive) {
            ctx.globalCompositeOperation = 'destination-out'; // Keep erasing mode if it was active
        }
    }

    // Resize the canvas to fill browser window dynamically
    window.addEventListener('resize', setupCanvas);


    window.setEraser = function() {
        eraserActive = true; // Indicate that eraser mode is active
        ctx.lineWidth = 30; // Increase the eraser size to be larger than the drawing size
        ctx.globalCompositeOperation = 'destination-out'; // This makes the stroke erase what's on the canvas
        ctx.beginPath(); // Start a new path for erasing
    };
    
    
    window.changeColor = function(color) {
        eraserActive = false; // Indicate that drawing mode is active
        currentColor = color;
        ctx.lineWidth = 5; // Reset to default drawing line width for coloring
        ctx.globalCompositeOperation = 'source-over'; // Reset to default drawing mode
        ctx.beginPath(); // Start a new path for color drawing
    };
    

    window.activateEraser = function() {
        eraserActive = true; // Activate eraser mode
        ctx.lineWidth = eraserLineWidth; // Apply larger line width for erasing
        ctx.globalCompositeOperation = 'destination-out'; // Set to erase mode
        ctx.beginPath(); // Start a new path for erasing
    };

    window.clearCanvas = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears the entire canvas
        // Optionally reset any drawing settings here
        eraserActive = false; // Reset eraser mode if it was active
        ctx.lineWidth = 5; // Reset to default drawing line width
        ctx.globalCompositeOperation = 'source-over'; // Ensure drawing mode is set to default
        currentColor = '#000000'; // Reset to a default color if desired
    };
    
    
});
