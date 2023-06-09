let timeouts = {};
// Create a new AudioContext if it doesn't exist
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const playAudio = (audioUrl) => {
    let timeout = timeouts[audioUrl];
    if (timeout) {
        clearTimeout(timeouts);
    }

    timeouts = setTimeout(() => {
        // Check if the audio data is already cached
        let cachedData = playAudio[audioUrl];
        let isCached = cachedData != null && cachedData != undefined;
        if (isCached) {
            // Create a new AudioBufferSourceNode
            const source = audioContext.createBufferSource();
            source.buffer = cachedData;

            // Connect the source to the audio output
            source.connect(audioContext.destination);

            // Start playing the audio
            source.start(0);
        } else {
            // Load the audio file
            const request = new XMLHttpRequest();
            request.open('GET', audioUrl, true);
            request.responseType = 'arraybuffer';

            request.onload = function () {
                // Decode the audio data
                audioContext.decodeAudioData(request.response, function (buffer) {
                    // Cache the decoded audio data
                    playAudio[audioUrl] = buffer;

                    // Create a new AudioBufferSourceNode
                    const source = audioContext.createBufferSource();
                    source.buffer = buffer;

                    // Connect the source to the audio output
                    source.connect(audioContext.destination);

                    // Start playing the audio
                    source.start(0);
                });
            };

            request.send();
        }
    }, 100);


}

export default playAudio;