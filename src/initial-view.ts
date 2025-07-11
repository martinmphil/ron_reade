export const initialView =
  `
<header>
  <a href="https://greenstem.uk/demo">GreenStem.uk</a>
</header>

<main>
  <h1>Convert text to speech</h1>
  <p><label for="ron_text">Enter text:</label></p>
  <textarea name="ron_text" id="ron_text" rows="20" cols="33"
    placeholder="Enter text here"></textarea>
  <div class="button-group">
    <button id="process_text_button" type="button" disabled>Create Speech</button>
    <button id="clear_button" type="button" disabled>Clear Text</button>
    <button id="halt_button" type="button" disabled>Halt Processing</button>
  </div>
  <audio id="audio_output" controls
    style="opacity: 0.4; transition: opacity 0.2s ease-in-out;">
  </audio>
  <p id="status_report">Downloading artificial neural network...</p>
  <progress id="progress_bar" max="100" value="0"
    style="opacity: 0; transition: opacity 0.2s ease-in-out; width: 100%;">
  </progress>
</main>

<footer>
  <h2>How it works</h2>
  <p>
    This web app uses advanced machine-learning running right in your browser to
    convert text into natural-sounding speech. Your text stays private on your device.
  </p>
  <p>
    Powered by <a href="https://huggingface.co/docs/transformers.js/index" target="_blank"
      rel="noopener noreferrer">Transformers.js</a>
    and <a href="https://huggingface.co/Xenova/speecht5_tts" target="_blank"
      rel="noopener noreferrer">Xenova</a>.
  </p>
  <p>
    Ron Reade project on <a href="https://github.com/martinmphil/ron_reade" target="_blank"
      rel="noopener noreferrer">GitHub</a>
  </p>
</footer>
`