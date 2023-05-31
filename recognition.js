let recognition = null;
let recocnitionStartTimeout = null;
var leftDetected = false;
var rightDetected = false;

// Function to restart the speech recognition
function restartRecognition() {

    if (recocnitionStartTimeout) {
        clearTimeout(recocnitionStartTimeout);
    }

    recocnitionStartTimeout = setTimeout(() => {
        // Stop the speech recognition
        if (recognition) {
            recognition.stop();
        }

        // Check browser support for the Web Speech API
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            // Create a new SpeechRecognition object
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            console.log(recognition)
            // Configure the speech recognition
            recognition.lang = 'en-US'; // Set the language to English (United States)
            recognition.continuous = true; // Enable continuous recognition

            // Set interimResults and maxAlternatives
            recognition.interimResults = true; // Enable returning interim results
            recognition.maxAlternatives = 2; // Set the maximum number of alternative transcriptions


            // Event handler for speech recognition results
            recognition.onresult = function (event) {

                // Get the transcript of the recognized speech
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();

                // Check if "left" or "right" is present in the transcript
                if (transcript.includes('left')) {
                    // Perform the desired action for "left"
                    console.log('Left detected!');
                    leftDetected = true;
                    restartRecognition();
                } else if (transcript.includes('right')) {
                    // Perform the desired action for "right"
                    console.log('Right detected!');
                    rightDetected = true;
                    restartRecognition();
                } else { console.log(transcript) }

            };

            // Start the speech recognition
            recognition.start();
        } else {
            console.log('Web Speech API is not supported in this browser.');
        }
    }, 10);

}

// Function to restart the speech recognition
function stopRecognition() {
    if (recognition) {

        // Stop the speech recognition
        recognition.stop();

        // Clear any existing recognition results
        recognition.onresult = null;

        clearTimeout(recocnitionStartTimeout);

    }
}

