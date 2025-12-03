# Cross Functional Requirements
The webpage page shall function effectively in the latest versions of Firefox, Safari and Chrome browsers (and preferably also on recent legacy versions). 

The app shall handle differences in audio codec support across browsers.

The app shall provide fallback behaviour for browsers that don't support required features.

The webpage shall adhere to free and open web standards. 

The webpage shall be constructed from semantic HTML and standard CSS and TypeScript transpiled into JavaScript. 

Script modules shall use ECMAScript module (ESM) syntax. 

The app shall support text to audio conversion of at least 10,000 characters without performance degradation.

User text input shall not be transmitted to any external server.

All speech synthesis shall occur locally in the browser.

The app shall not store user text input beyond the current session.

# Cache
The app shall use the browser cache to store large model files for for subsequent visits.

When the cached model is available, the app shall use it instead of downloading again.

The app shall provide a mechanism to clear cached model data if needed.

# Open Page 
Speaker embeddings shall be loaded from a local binary file.

The webpage shall display a text input area. 

The text input area shall display clear instructions for the user to enter text. 

The webpage shall display a "Create Speech" button.

The webpage shall display a "Clear Text" button.

The webpage shall display a "Halt Processing" button.

The webpage shall display an audio player.

When the webpage opens, the app shall download the artificial neural network model. 

If model loading fails, then the app shall retry downloading the model. 

If retrying model loading fails, then the app shall attempt a second retry at downloading the model. 

If the second retry at downloading the model fails, then the app shall raise a model-loading error. 

While the model downloads, all speech-to-text control buttons shall be disabled. 

While the model downloads, the app shall allow users to enter text into the text input area. 

While the model downloads the audio element shall be semitransparent. 

When model successfully downloads the audio element shall become fully opaque. 

If network connectivity is lost during model download, then the app shall provide appropriate feedback.

# Text Chunking
When converting text to audio, the app shall segment the text entered by the user into chunks such that each chunk length is the smallest of 400 characters or 1 sentence as defined by a period character or a new line. 

# Web Worker
The app shall remain responsive while processing text to audio conversion by running synthesis in a Web Worker.

When the Web Worker encounters an error during synthesis, the app shall gracefully handle the error and return to a ready state.

If the browser does not support Web Workers, the app shall display an appropriate error message.

If the browser does not support the Web Audio API, the app shall gracefully degrade or inform the user.

The app shall detect and handle browser-specific limitations for Web Workers.

# Text Input Validation
The text input area shall accept a maximum of 10,000 characters.

When the text input area reaches maximum capacity, the app shall prevent further text entry.

The app shall provide visual feedback when approaching the character limit.

The text input area shall accept standard Unicode text characters.

The text input area shall preserve line breaks and paragraph structure entered by the user.

# Status message
When the webpage opens, the status message shall show "Downloading artificial neural network." as an ongoing process. 

The webpage shall display the progress of ongoing process by regularly adding period characters to the end of the status message. 

When the number of periods characters at the end of the status message reaches 5, the status bar shall reset to a single period character as the end of the status message. 

If model loading fails, then the status message shall show "Retrying download."

If retrying model loading fails, then then the status message shall show the status message shall show "Second download retry."  as an ongoing process. 

If the second retry at downloading the model fails, then the status message shall show "Please try reloading the page." 

When the model successfully loads, the status message shall show "Ready to convert your text into speech." 

While the model is active, and when the text input is empty, the status message shall show "Please enter text to be read aloud." 

While the model is active, and when the user has entered new text into the text input, the status message shall show "Ready to convert your text into speech."

While the app is converting text to audio, the status message shall show `Processing chunk {current_chunk_number} of {total_number_of_chunks}.` 

When the text to audio conversion job completes, the status message shall show "Please press play on the audio player." 

If the text to audio conversion job generates a fault, then the status message shall show "Please try reloading the page." 

When the text to audio conversion job has completed, and when the user presses the play button on the audio player, the status message shall show "Playback in progress." 

When the text to audio conversion job has completed, and when the user presses the pause button on the audio player, the status message shall show "Playback paused." 

While the model is active, and when the user presses the pause button on the audio player, and when the user has entered new text into the text input, the status message shall show "Playback paused. Ready to process new text." 

If the audio playback generates a fault, then the status message shall show "Please try reloading the page." 

While the model is active, and when audio playback finishes, the status message shall show "Please enter new text to be read aloud." 

If any unhandled error occurs, then the status message shall show "Please try reloading the page." 

# User Interactions
When the user navigates to the webpage, the input box shall accept pasted text to be read aloud.

When the user navigates to the webpage, the input box shall accept keyboard text input to be read aloud.

When the user has entered text into the input box, the webpage shall offer a button to clear the input box. 

When the user triggers a text to audio conversion job, the app shall start converting the user's text input into audio output. 

When the user halts the text to audio conversion job, the app shall immediately terminate the speech synthesis process, discard any partially generated audio, and return to a state ready to synthesise speech with the current contents of the text input area.

When the user halts the text to audio conversion job the webpage shall accept new text input. 

When the text to audio conversion job completes, the webpage audio player becomes available for playback. 

When the audio plays, the webpage audio player shall offer users the standard controls of pause, play, or jump to any arbitrary moment in the audio.

When the user enters new keyboard input, the webpage shall become ready to convert this new text input into audio output. 

When the user pastes new text into the webpage, the webpage shall become ready to convert this new text input into audio output.

While the text input area is clear, the Create Speech button shall be disabled.

While the text input area remains unchanged, when the Create Speech button is pressed, the Create Speech button shall become disabled. 

When the user pastes or types new text into the text input area, the Create Speech button shall become enabled. 

## Clear Text Button
When the user enters text into the text input area element, the Clear Text button shall become enabled. 

While the Clear Text button is enabled, and when the user presses the Clear Text button, the text input area shall clear.

While the text input area is empty, the Clear Text button shall be disabled.

While synthesis is in progress, the Clear Text button shall remain enabled to allow users to clear text without halting synthesis.

When the Clear Text button is pressed during audio playback, playback shall continue uninterrupted.

## Triggering Text to Audio Conversion 
While the model is active, when the user enters new text into the text input area, the Create Speech button shall be enabled. 

While the model is active, and while the Create Speech button is enabled, when the user presses the Create Speech button, the app shall start the job of converting text into audio. 

## Halt Processing Button
While the app is not converting text to audio the Halt Processing button shall be disabled. 

While the app converts text to audio the Halt Processing button shall be enabled. 

While the app is converting text to audio, when the user presses the Halt Processing button, the app shall terminate the text to audio conversion job. 

While the app is converting text to audio, when the user clears the text input area, the Halt Processing button shall remain enabled.

When the user presses the Halt Processing button, the app shall immediately terminate the speech synthesis process in the web worker.

When the user presses the Halt Processing button, the app shall discard any partially generated audio chunks.

While there is text in the text input area, and when the user presses the Halt Processing button, the app shall transition to a state ready to synthesise speech with the current contents of the text input area.

When the user presses the Halt Processing button, the Create Speech button shall become enabled only if the text input area contains text. 

# Audio Playback
When the text to audio conversion job completes, the audio shall become fully opaque. 

When the text to audio conversion job has completes and the audio is primed for playback, the audio element shall offer the user audio controls to play, pause, or rewind the audio at their convenience. 

While the audio is playing, the Create Speech button shall be disabled. 

When the user pauses playback, and when the user has entered new text in the text input area, the Create Speech button shall be enabled. 

When playback finishes, and when the user has entered new text in the text input area, the Create Speech button shall be enabled. 

The audio player shall support volume control.

The audio player shall support seeking to any position in the audio.

When the user seeks to a different position during playback, playback shall continue from the new position.

When audio playback is paused and the user enters new text, the paused audio shall remain available for continued playback.

# Audio Output Quality
The generated audio shall have a sampling rate of at least 16000 Hz.

The generated audio shall be encoded in WAV format for playback.

The audio player shall display the total duration of the generated audio. 
