# Ron Reade 
Realistic Text-To-Speech in a browser with local neural networks. 
🖹🡒🗣 

# Summary 
The Ron Reade text-to-speech web app reads text aloud to a user. A user inputs text and the app converts this text into audio via a compact artificial neural network running locally in their web browser. The app verbalises the user's text directly in their browser as an audio stream with realistic speech patterns and natural cadence. 

Ron Reade uses a small machine-learning model from [Xenova](https://github.com/xenova) called [speecht5_tts](https://huggingface.co/Xenova/speecht5_tts). The model runs locally in the browser using the [Transformers.js](https://github.com/huggingface/transformers.js) library from [Hugging Face](https://huggingface.co/). This app employs a machine-learning encoder-decoder methodology followed by a HiFi-GAN (High-Fidelity Generative Adversarial Network) vocoder process to convert text to speech. 

# Architecture
The application follows a responsive, event-driven architecture separating the User Interface (Main Thread) from the intensive Machine Learning operations (Web Worker).

## Web Worker
To ensure the User Interface remains responsive during heavy neural network operations, all model loading and speech synthesis tasks are offloaded to a dedicated Web Worker.
- Main Thread: Handles UI rendering, user input, state management, and audio playback.
- Web Worker: Handles model downloading, caching, text tokenization, and audio waveform generation.

Communication between threads is handled via asynchronous message passing:
- `INIT`: Main thread tells Worker to load resources.
- `GENERATE`: Main thread sends text to Worker.
- `PROGRESS`: Worker reports chunk completion status.
- `AUDIO_CHUNK`: Worker streams generated audio buffers back to Main.
- `DONE`: Worker signals completion.
- `ABORT`: Main thread signals Worker to halt immediately.

# App States
Text-to-speech conversion and playback. 
The app state is a combination of four interconnected sub-states Model, Wordings, Synthesis, and Audio. 

## Model
Describes the downloading and availability of the text-to-speech model. 
### Downloading_model
Text-to-speech model is downloading.
### Active_model
Text-to-speech model is active and available to the app.
### Retrying_downloading
Text-to-speech model failed to download which triggers the app to implement a retry strategy.
### Unavailable_model

## Wordings 
Describes the state of the user text input,
### Blank_wordings
User input before the user enters text.
### Pending_wordings 
User input has entered new text.
### Dispatched_wordings
User input has been dispatched for speech synthesis. 
### Converted_wordings

## Synthesis
### Dormant_synthesis
The model is available but wordings have yet to be dispatched, which requires `Active_model`.
### Processing_synthesis
The model is available and wordings have been dispatched to the model, which requires `Dispatched_wordings`.
### Competed_synthesis
The text to speech synthesis has completed and the audio becomes ready for playback.

## Audio for user to hear 
### Vacant_audio
The audio player has no audio to play.
### Primed_audio
The audio player has an audio output ready to play, which requires `Competed_synthesis`.
### Playing_audio
The audio player is playing audio to the user, which requires `Primed_audio`. 
### Paused_audio
The user has paused the audio playback. 

# Events 
Open_page

# Initial HTML
```html
<main>
  <h1>Convert text to speech</h1>
  <p><label for="ron_text">Enter text:</label></p>
  <textarea name="ron_text" id="ron_text" rows="12" cols="36"
    placeholder="Enter text here"></textarea>
  <div role="group" aria-label="text-to-speech controls">
    <button id="process_text_button" type="button" disabled>Create Speech</button>
    <button id="clear_button" type="button" disabled>Clear Text</button>
    <button id="halt_button" type="button" disabled>Halt Processing</button>
  </div>
  <audio id="audio_output" controls></audio>
  <p id="status_report">Downloading artificial neural network</p>
</main>
```
# Page Opens
The browser loads the Xenova model and speaker embeddings.

# Converting Text to Audio
The app captures text from the text input area and breaks it into chunks as governed by a set of text chunking rules (see requirements.md).

## Audio Pipeline
Tokenization: Text chunks are tokenized by the model's tokenizer.

Synthesis: The `speecht5_tts` model generates a Mel Spectrogram.

Vocoder: The HiFi-GAN vocoder converts the spectrogram into a raw audio waveform.

Encoding: The raw Float32 audio data is encoded into a WAV format blob with a sampling rate of 16,000 Hz.

Playback: The WAV blob is set as the source for the HTML `<audio>` element.

# Control Logic
## Halt Processing
When the user initiates a halt:
1. The Main Thread sends an `ABORT` message to the Web Worker.
2. The Web Worker's `AbortController` triggers, immediately stopping the generation loop.
3. Any partially generated audio chunks in the Main Thread are discarded.
4. The app examines the content of the text input area and transitions to an appropriate state (either `Blank_wordings` or `Pending_wordings`), enabling the user to edit text or restart immediately.

# Data Management
## Model Caching
The application leverages the browser's Cache API to store the downloaded `speecht5_tts` model files.

On first load the model is downloaded and cached.

On subsequent loads the model is retrieved from cache, enabling offline-capable startup.

## Speaker Embeddings
Speaker characteristics are defined by a binary embeddings file (`speaker_embeddings.bin`) loaded locally. This ensures consistent voice output without requiring external API calls for voice definition.

# Privacy & Security
All speech synthesis occurs locally within the user's browser. No text is sent to external servers.

User input is destroyed at the end of the current session.
