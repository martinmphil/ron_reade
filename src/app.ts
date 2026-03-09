import '../style.css'
import { createActor } from 'xstate';
import { machine } from './machine';
import { AudioPlayer } from './audio-player';

console.log('Ron Reade app starting...')

// Elements
const textArea = document.querySelector<HTMLTextAreaElement>('#ron_text')!
const processButton = document.querySelector<HTMLButtonElement>('#process_text_button')!
const clearButton = document.querySelector<HTMLButtonElement>('#clear_button')!
const haltButton = document.querySelector<HTMLButtonElement>('#halt_button')!
const audioOutput = document.querySelector<HTMLAudioElement>('#audio_output')!
const statusReport = document.querySelector<HTMLParagraphElement>('#status_report')!

// Helpers
const audioPlayer = new AudioPlayer(audioOutput);

// Actor
const actor = createActor(machine);

actor.subscribe((snapshot) => {
    console.log('State:', snapshot.value);
    console.log('Context:', snapshot.context);

    // Update Status Report
    // We need to map state to status message based on state dictionary
    // Since we have parallel states, we need to check matches
    let statusText = '';

    // Model Manager Status
    if (snapshot.matches({ Model_Manager: 'Model_Acquisition' })) {
        statusText = 'Downloading artificial neural network';
    } else if (snapshot.matches({ Model_Manager: 'Model_Acquisition_Retry' })) {
        statusText = `Model loading failed - retry ${snapshot.context.retryCount}`;
    } else if (snapshot.matches({ Model_Manager: 'Model_Unavailable' })) {
        statusText = 'Sadly we encountered a problem. Please reload this page or try again later.';
    } else {
        // Model Primed
        const inputState = (snapshot.value as any).Model_Manager?.Model_Primed?.Input;
        const isProcessing = inputState === 'Converting' || inputState === 'Chunk_Finished';

        if (isProcessing) {
            statusText = `Processing text chunk ${snapshot.context.processingChunkIndex + 1} of ${snapshot.context.totalChunks}`;
        } else if (inputState === 'Conversion_Error') {
            statusText = 'Sadly we encountered a problem. Please try again.';
        } else if (snapshot.matches({ Model_Manager: { Model_Primed: { Output: 'Speech_Ready' } } })) {
            statusText = 'Ready.';
        } else {
            // Default ready state
            statusText = 'Please enter text to be read aloud.';
        }
    }

    // Text Validation Status Overrides
    if (snapshot.matches({ Text_Validation: 'Excessive_Word_Length' })) {
        statusText = 'Your text contains overly long words. Please provide plain text where all words are shorter than 50 letters.';
    } else if (snapshot.matches({ Text_Validation: 'Excessive_Text_Length' })) {
        statusText = 'Text too long. Please limit your input to 10,000 characters.';
    }

    statusReport.innerText = statusText;

    // Toggle loading class for ellipsis animation
    const inputStateClass = (snapshot.value as any).Model_Manager?.Model_Primed?.Input;
    const isProcessingClass = inputStateClass === 'Converting' || inputStateClass === 'Chunk_Finished';

    if (isProcessingClass || snapshot.matches({ Model_Manager: 'Model_Acquisition' })) {
        statusReport.classList.add('loading');
    } else {
        statusReport.classList.remove('loading');
    }

    // Button States
    const isModelPrimed = snapshot.matches({ Model_Manager: 'Model_Primed' });
    const isTextValid = snapshot.matches({ Text_Validation: 'Text_Valid' });
    const isConverting = snapshot.matches({ Model_Manager: { Model_Primed: { Input: 'Converting' } } });
    const isTextEmpty = snapshot.matches({ Text_Validation: 'Text_Empty' });

    // Create Speech Button
    // Enable: Model_Primed AND Text_Valid AND NOT Converting
    processButton.disabled = !(isModelPrimed && isTextValid && !isConverting);

    // Clear Text Button
    // Enable: NOT Text_Empty (mostly, simpler check)
    clearButton.disabled = isTextEmpty;

    // Halt Button
    // Enable: Converting
    haltButton.disabled = !isConverting;

    // Audio Output Visibility
    // Handled by AudioPlayer mostly, but "Speech_Ready" state signals it should be active/opaque.
    // "Audio_Empty" -> semitransparent/hidden.
    if (snapshot.matches({ Model_Manager: { Model_Primed: { Output: 'Audio_Empty' } } })) {
        if (audioOutput.src || audioOutput.hasAttribute('src')) {
            audioPlayer.clearAudio();
        }
    } else if (snapshot.matches({ Model_Manager: { Model_Primed: { Output: 'Speech_Ready' } } })) {
        // We only set audio once when transition happens? 
        // Or we can check if audio is set.
        // The machine accumulates audio. On success, we should join it.
        // Wait, AudioPlayer expects Float32Array.
        // We have accumulatedAudio which is Float32Array[].
        // We need to merge them.
        // BUT the event "CONVERSION_SUCCESS" (internal) just happened.
        // We should potentially do this in an action or effect.
        // Here in subscriber is "reactive", which is fine.
        const audioChunks = snapshot.context.accumulatedAudio;
        if (audioChunks.length > 0 && !audioOutput.src) { // Only set if not already set? 
            // Logic: If we just entered Speech_Ready, we should set it.
            // Merging audio:
            const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const merged = new Float32Array(totalLength);
            let offset = 0;
            for (const chunk of audioChunks) {
                merged.set(chunk, offset);
                offset += chunk.length;
            }
            audioPlayer.setAudio(merged, 16000); // Spec says 16000
        }
    }

    // Text Area Formatting/Sync
    // We update text area value if it differs (e.g. clear text)
    if (textArea.value !== snapshot.context.text) {
        // Only update if it's a programmatic clear, otherwise we interfere with typing?
        // If state is Text_Empty, we expect empty.
        if (snapshot.matches({ Text_Validation: 'Text_Empty' }) && textArea.value.length > 0) {
            textArea.value = '';
        }
    }
});

actor.start();
actor.send({ type: 'APP_OPENS' });

// Event Listeners
textArea.addEventListener('input', (e) => {
    const text = (e.target as HTMLTextAreaElement).value;
    actor.send({ type: 'TEXT_UPDATED', text });
});

processButton.addEventListener('click', () => {
    actor.send({ type: 'PROCESS_TEXT' });
});

clearButton.addEventListener('click', () => {
    actor.send({ type: 'CLEAR_TEXT' });
    textArea.focus();
});

haltButton.addEventListener('click', () => {
    actor.send({ type: 'HALT_PROCESSING' });
});
