# Ron Reade App Design Document

## Goal

The Ron Reade app converts a user's text into spoken words.

## Behaviour

### Entering Text

A user can copy and paste, or type, written words into the app, which will then read this text aloud. The user can also clear the text they have entered.

### Status Reporting

The app provides clear textual information indicating its current state and offers simple, helpful instructions. Visual feedback, including a progress bar, shows the progress of each stage of the text-to-speech process.

### Listening to Speech

When a user presses the "Create Speech" button, the app begins converting their text into speech. The user can halt this process at any time by pressing the "Halt Processing" button.

The browser's audio player is enabled once the audio stream is ready. The user can use the standard controls on the audio player to play, pause, or rewind the generated speech.

If the user types new text into the text area, they can repeat the process.

## Implementation

The HTML exported by the `initial-view.ts` module creates the user's initial view of the web app.

The app loads the Xenova model and speaker embeddings. While the model is downloading, all buttons are disabled, but the user can enter text into the `ron_text` text area. The `audio_output` element is semitransparent until the audio is ready to play.

If the user enters text into the `ron_text` element, the `clear_button` becomes enabled. If the user presses the `clear_button`, the text is cleared, and the `process_text_button` is disabled if it was previously enabled.

Once the Xenova model and speaker embeddings have successfully downloaded, the `status_report` paragraph will display: "Please enter text to be read aloud into the text area above."

If the model has successfully downloaded and the user has entered text, the `process_text_button` is enabled, and the `status_report` paragraph will display: "Ready to convert your text into speech."

Pressing the `process_text_button` initiates the conversion of the user's text into audio. The text is captured from the `ron_text` text area and broken into chunks. The end of a text chunk is identified at either a full stop or a length of 400 characters, whichever is shorter. Each text chunk is converted into an audio buffer using the Hugging Face `transformers.js` library with the Xenova model and a speaker embeddings file. These audio buffers are then concatenated into a seamless audio stream which is passed to the `<audio>` element for playback.

During text-to-speech conversion, a progress bar indicates how many chunks of text remain until the process completes and the audio becomes available.

The text input area remains active while the app processes the user's text which allows the user to alter their current text input which automatically halts any text processing. 

The `halt_button` is enabled only while the app is processing text. Pressing the `halt_button` terminates the current web worker, discards any partially generated audio, and reloads the model.

When the user's full text has been processed into audio, the `audio_output` element becomes opaque. The `status_report` paragraph displays: "Please press the play button on the audio player above." The user can then play, pause, or rewind the audio at their convenience.

The `process_text_button` is disabled while audio is playing but is re-enabled if the user modifies the text in the `ron_text` text area.

When audio playback is complete, the `status_report` paragraph again displays: "Please enter text to be read aloud into the text area above." If the text in the `ron_text` element has changed, the `process_text_button` is enabled.

The `status_report` element displays appropriate messages to the user throughout all interactions and processes, including "Playback in progress..." and "Playback paused."

If any part of the process fails, the app will automatically retry the failed process with a maximum of seven retries. If loading the model fails, the `status_report` element will continue to display "Downloading artificial neural network..." If processing the text fails, it will display "Processing..." If the same failure repeats after seven retries, the app is considered faulty, and the `status_report` element will display: "Please try reloading the page."
