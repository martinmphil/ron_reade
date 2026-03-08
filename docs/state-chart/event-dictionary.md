| Event (Trigger)          | Source | Physical Action / Logic Signal                                                                                              |
|--------------------------|--------|-----------------------------------------------------------------------------------------------------------------------------|
| APP_OPENS                | System | The browser finishes loading the initial HTML, CSS, and JS bundle.                                                          |
| MODEL_LOADED             | System | The artificial-neural-network model and all associated necessary resources are successfully cached in the browser's memory. |
| RETRY_TIMER_TICK         | System | Delay factor fired by model loading retry strategy                                                                          |
| MODEL_ACQUISITION_FAILED | System | Retry strategy for model loading has failed to load the text-to-speech model and all associated necessary resources.        |
| TEXT_UPDATED             | System | HTML input event on the text-area fires on every keystroke, paste, or deletion and triggers validation guards.              |
| PROCESS_TEXT             | User   | Pressing the 'Create Speech' button. (Note: Logic is ignored unless the state is Text_Valid and Model_Primed).              |
| CLEAR_TEXT               | User   | Pressing the 'Clear Text' button. This resets both the text-area content and the Text_Validation state region.              |
| HALT_PROCESSING          | User   | Pressing the 'Halt Processing' button during an active text-to-speech conversion job.                                       |
| CONVERSION_SUCCESS       | System | The text-to-speech conversion successfully completes for the final audio chunk for the current Text Manifest.               |
| CONVERSION_FAILED        | System | The text-to-speech conversion engine throws an exception or error during processing.                                        |
| UNCAUGHT_EXCEPTION       | System | A global error listener catches a critical system crash (e.g., window.onerror).                                             |
