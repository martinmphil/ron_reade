# Summary
This document outlines the implementation techniques applied in the Ron Reade text-to-speech web app. 

# Text-to-Speech Model 
Ron Reade uses small machine-learning models from [Xenova](https://github.com/xenova) called [speecht5_tts](https://huggingface.co/Xenova/speecht5_tts). The model runs locally in the browser using the [Transformers.js](https://github.com/huggingface/transformers.js) library from [Hugging Face](https://huggingface.co/). This app employs a machine-learning encoder-decoder methodology followed by a HiFi-GAN (High-Fidelity Generative Adversarial Network) vocoder process to convert text to speech. 

## Speaker Embeddings
Speaker `embeddings` in `./assets/speaker_embeddings.bin`. 

# Hosting 
The app will initially be hosted at greenstem.uk/demo/ron-reade/ 

# Architecture 
The application follows a responsive, event-driven architecture. 

All code should be guided by testing, linting, automated validation, and code review. 

Maintainable code must be simple and explicit and easy for humans to read and understand. 

Construct the app from semantic HTML and standard CSS and TypeScript transpiled into JavaScript. 

Use ECMAScript module (ESM) syntax. 

The UI must remain responsive. Keep the web browser's main thread for UI. Isolate long running and computationally intensive actions, like downloading models and Machine Learning operations, by using techniques like Web Workers. 

The text-area is a persistent, non-blocking interface element that should always be editable. 

Animations and visual transitions should only use CSS without using any JavaScript. 

## State-Chart
Implement state-chart logic using contemporary standards for finite state machines (eg XState or similar formalised state-chart library) to ensure the app remains faithful to the specification. 

# Main HTML Element 
```html
<main>
  <h1>Convert text to speech</h1>
  <p><label for="ron_text">Enter text:</label></p>
  <textarea name="ron_text" id="ron_text" rows="12" cols="36"
    placeholder="Enter text here"></textarea>
  <div role="group" aria-label="text-to-speech controls">
    <button id="process_text_button" type="button" disabled>Create Speech</button>
    <button id="clear_button" type="button">Clear Text</button>
    <button id="halt_button" type="button" disabled>Halt Processing</button>
  </div>
  <audio id="audio_output" controls></audio>
  <p id="status_report">Downloading artificial neural network</p>
</main>
```
# HTML Elements Internal State  
The text-area HTML element handles its own internal state for the current text string representing the text entered by the user. 

The audio player HTML element handles its own internal state for playing, pausing, and seeking ahead or rewinding playback. 

# Animated Ellipsis 
To avoid the perception of system freeze append an animated ellipsis to the status message paragraph to indicating activity in a background process. While an ongoing process continues, the animated ellipsis gives a liveliness pulses to signify activity by slowly adding full-stop characters. When 5 ellipsis full-stop characters have been added to the animated ellipsis, the animated ellipsis disappears, then resets and continues to slowly add full-stop characters to the end of a status message paragraph. The animated ellipsis disappears when the ongoing process completes. 

## Speech Synthesis Pipeline 
The app captures the text entered by the user from the text-area input on the webpage and breaks it into chunks. 

Speaker characteristics are defined by a binary embeddings file (`speaker_embeddings.bin`) that ensures consistent voice output without requiring external API calls for voice definition.

Text chunks are tokenized by the model's tokenizer.

The `speecht5_tts` model generates a Mel Spectrogram.

The HiFi-GAN vocoder converts the spectrogram into a raw audio waveform.

The raw Float32 audio data is encoded into a WAV format blob with a sampling rate of 16,000 Hz.

The WAV blob is set as the source for the HTML `<audio>` element.


# Model Manager 
The app must load the local text-to-speech artificial-neural-network model (eg Xenova model) and all associated necessary resources (eg speaker embeddings). 

The app tries retrieving these text-to-speech model files and all associated necessary resources from the browser cache. 

If these text-to-speech model files are unavailable from the browser cache, the app tries downloading them via the internet. 

If the app fails to download these text-to-speech model files, then the app shall employ a timely retry strategy while ensuring the variables needed to manage the retries are initialised in a suitable scope to persist correctly during the retry loop. The retry strategy should read any appropriate HTTP response header and also uses an exponential back-off plus some random jitter which aims to introduce a delay of no longer than 8 seconds to then next download attempt. 


# Relative File Paths
Never hard-code absolute file paths into any project file. Construct all paths dynamically at runtime, relative to the project root directory. This ensures the project is portable and protects the privacy of the local file system structure. 


# TypeScript 
Minimise the use to the `any` type.
















