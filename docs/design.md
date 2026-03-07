# Ron Reade 
Realistic Text-To-Speech in a browser with local neural networks. 
🖹🡒🗣 

# Summary 
The Ron Reade text-to-speech web app reads text aloud to a user. A user inputs text and the app converts this text into audio via a compact artificial neural network running locally in their web browser. The app verbalises the user's text directly in their browser as audio playback with realistic speech patterns and natural cadence. 

Ron Reade uses a small machine-learning model from [Xenova](https://github.com/xenova) called [speecht5_tts](https://huggingface.co/Xenova/speecht5_tts). The model runs locally in the browser using the [Transformers.js](https://github.com/huggingface/transformers.js) library from [Hugging Face](https://huggingface.co/). This app employs a machine-learning encoder-decoder methodology followed by a HiFi-GAN (High-Fidelity Generative Adversarial Network) vocoder process to convert text to speech. 

# Architecture
The application follows a responsive, event-driven architecture separating the User Interface (Main Thread) from the intensive Machine Learning operations (Web Worker).

# State-Chart
State-chart logic is implemented using contemporary standards for finite state machines (eg XState) to ensure the app remains faithful to the specification. 

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

# Main User Interface (UI) Elements
The main UI elements are the: 
* text-area for user to input text
* "Create Speech" button
* "Clear Text" button 
* "Halt Processing" button 
* audio element for playing speech 
* status report paragraph displaying messages to the user

# Model Manager 
The app must load the local text-to-speech artificial-neural-network model (eg Xenova model) and all associated necessary resources (eg speaker embeddings). 

The app tries retrieving these text-to-speech model files and all associated necessary resources from the browser cache. 

If these text-to-speech model files are unavailable from the browser cache, the app tries downloading them via the internet. 

If the app fails to download these text-to-speech model files, then the app employs a timely retry strategy. 

# Converting Text to Speech 
The app captures the text entered by the user from the text-area input on the webpage and breaks it into chunks. 

Speaker characteristics are defined by a binary embeddings file (`speaker_embeddings.bin`) that ensures consistent voice output without requiring external API calls for voice definition.

Text chunks are tokenized by the model's tokenizer.

The `speecht5_tts` model generates a Mel Spectrogram.

The HiFi-GAN vocoder converts the spectrogram into a raw audio waveform.

The raw Float32 audio data is encoded into a WAV format blob with a sampling rate of 16,000 Hz.

The WAV blob is set as the source for the HTML `<audio>` element.

# Privacy & Security
All speech synthesis occurs locally within the user's browser. No text is sent to external servers.

User input is destroyed at the end of the current session.
