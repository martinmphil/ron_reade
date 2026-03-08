Requirements
============

This document contains the requirements for Ron Reade text-to-speech web app. 

App requirements are typically formatted using [EARS](https://alistairmavin.com/ears/) syntax. 

# Goal 
Hosting a portable, usable, aesthetically pleasing text-to-speech web app represents success. 

# User Stories 
As a user, I want to hear my written text narrated aloud in realistic speech patterns with natural prosody. 

# State Chart 
Essential requirements are described in the `./state-chart-tables` directory holding the State Chart files specified in tabular form as `event-dictionary.md`, `glossary.md`, `state-dictionary.md` and `transition-map.md` 

# Cross Functional Requirements
The app shall process text-to-speech as quickly as possible.

The webpage page shall function effectively in the latest versions of Firefox, Safari and Chrome browsers (and preferably also on recent legacy versions). 

The app shall detect and handle browser-specific limitations and provide fallback behaviour for browsers that don't support required features.

The webpage shall adhere to free and open web standards. 

The app shall support text-to-speech conversion of at least 10,000 characters without performance degradation.

All speech synthesis shall occur locally in the browser. 

The app shall keep all user data private. 

The app shall only store user text input during the current browser session. 

# User Interface (UI)
The user interface shall always remain responsive. 

The webpage shall display a text-area for user input. 

The webpage shall display a "Create Speech" button.

The webpage shall display a "Clear Text" button.

The webpage shall display a "Halt Processing" button. 

When the app opens, the webpage shall display a semitransparent audio player. 

While no audio data exists, the audio element shall remain semitransparent. 

When audio data becomes available to play, the audio player shall become fully opaque. 

The webpage shall display a status message paragraph. 

The text-area shall display clear instructions for the user to enter text. 

Opacity transitions shall fade pleasingly. 

While an ongoing background process continues for a long duration, the webpage shall avoid the perception of system freeze by indicating activity with an animated ellipsis appended to the status message paragraph. 

When an ongoing background process completes, the animated ellipsis shall disappear. 

# Model Loading
When the app opens, the app shall load the text-to-speech artificial-neural-network model and all associated necessary resources. 

While the model downloads, the Create Speech button shall be disabled. 

While the model downloads, the Halt Processing button shall be disabled. 

While the model downloads, the text-area shall accept user input. 

If model loading fails, then the app shall implement a timely retry strategy. 

## Cache
The app shall use the browser cache to store large model files. 

When cached files are available, the app shall use these cached files instead of downloading the same large files again via the internet. 

# Status message
When the app opens, the status message shall show "Downloading artificial neural network." as an ongoing process with an animated ellipsis. 

If model loading fails, while the app attempts a model loading retry strategy, then the status message shall show `Model loading failed - retry {retry_count}`. 

If the model loading retry strategy fails, then the status message shall show "Sadly we encountered a problem. Please reload this page or try again later." 

When the model successfully loads, the status message shall show "Please enter text to be read aloud." 

While the app is converting text-to-speech, the status message shall show `Processing text chunk {current_chunk_number} of {total_number_of_chunks}.` with an animated ellipsis. 

When audio player is ready to play audio data, the status message shall show "Ready." 

If the text-to-speech conversion process fails, then the status message shall show "Sadly we encountered a problem. Please try again."

If any unrecoverable error occurs, then the status message shall show "Sadly we encountered a problem. Please reload this page or try again later." 

# Text Chunking
When text-to-speech processing starts, the app shall help maintain natural prosody by segmenting text entered by the user in the text-area into manageable chunks. 

While chunking text for processing, the app shall only split chunks at word boundaries. 

The app shall chunk text using a top-down hierarchical in the following hierarchical order:
1. Paragraph-Level Segmentation 
The app shall first identify paragraphs based on line breaks provided in the user input. 
If a paragraph contains 400 characters or fewer, it shall be assigned as a single processing chunk. 
If a paragraph exceeds 400 characters, the app shall proceed to Sentence-Level Segmentation for that specific paragraph. 
2. Sentence-Level Segmentation 
For paragraphs exceeding the character limit, the app shall identify individual sentences. 
If a sentence contains 400 characters or fewer, it shall be assigned as a single processing chunk. 
If an individual sentence exceeds 400 characters, the app shall proceed to Word-Boundary Segmentation for that specific sentence. 
3. Word-Boundary Segmentation (Fallback) 
For sentences exceeding 400 characters, the app shall segment the text into chunks at the nearest word boundary that does not exceed the 400-character limit. 
The app shall never split a chunk inside a word. 

# Text Input
The text-area shall accept pasted text.

The text-area shall accept keyboard text.

The text-area shall accept a maximum of 10,000 characters. 

When the text-area reaches maximum capacity, the text-area shall prevent further text entry. 

When the text-area reaches maximum capacity, the status message shall show "Text too long. Please limit your input to 10,000 characters." 

When the text-area approaches maximum capacity, the text-area shall provide visual feedback to the user. 

If the text-area input contains any word longer than 50 characters, then the status message shall show "Your text contains overly long words. Please provide plain text where all words are shorter than 50 letters." 

## Clear Text Button
When the user presses the Clear Text button, the text-area shall clear. 

While text-to-speech conversion is in progress, when the user presses the Clear Text button, the ongoing text-to-speech conversion process shall continue uninterrupted. 

While audio is playing, when the user presses the Clear Text button, playback shall continue uninterrupted. 

## Text-To-Speech Conversion 
When the user presses the Create Speech button, while the Create Speech button is enabled, and while the text exists, and while the text length is under 10,000 characters, and while every word in the text is under 50 characters, the app shall terminate any current audio playback and flush all audio data, and make the audio player semitransparent, and begin the text-to-speech conversion process. 

If the text-area contains a word equal to or exceeding 50 characters, then the app shall prevent the initiation of the speech-to-text process. 

If the total character count in the text-area exceeds 10,000 characters, then the app shall prevent the initiation of the speech-to-text process. 

If the text-area is empty when the user presses the Create Speech button, then the app shall prevent the initiation of the speech-to-text process and the status message shall show "Please enter text to be read aloud." 

When the text-to-speech conversion process begins, the app shall take an immutable snapshot the user's text content in text-area and save this as an input source for the text-to-speech process. 

While the app is converting text-to-speech, the Create Speech button shall be disabled. 

## Halt Processing Button 
While the app is awaiting a text-to-speech conversion job, the Halt Processing button shall be disabled. 

While the app is converting text-to-speech, the Halt Processing button shall be enabled. 

While the app is converting text-to-speech, when the user presses the Halt Processing button, the app shall immediately abort the current speech text-to-speech conversion process, and discard all partially generated audio, and return to a state ready to convert text-to-speech with the current contents of the text-area. 

# Audio Playback
When the text-to-speech conversion job completes, the audio data shall be assigned as the audio source for the audio player. 

When audio data becomes available to play, the audio player shall offer users the standard controls of pause, play, or jump to any arbitrary moment in the audio. 

When audio data becomes available to play, the audio player shall display the total duration of the generated audio. 

When audio data becomes available to play, the audio player shall support volume control. 

When the app starts processing a new text-to-speech job, that app shall terminate current playback, and flush all audio data, and make the audio element semitransparent. 

# Fault Tolerance 
If the app encounters any error or an exception, then app shall gracefully reset to a state ready to accept new input for text-to-speech conversion. 
