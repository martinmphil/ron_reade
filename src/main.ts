import './style.css'
import { setupRon } from './ron.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header>
  <p>Text-To-Speech via <a
      href="https://huggingface.co/docs/transformers.js/index">Transformers.js</a></p>
</header>

<main>
  <h1>Ron Reade</h1>
  <p><label for="ron_text">Enter text:</label></p>
  <textarea name="ron_text" id="ron_text" rows="20" cols="33">
    Know thyself
  </textarea>
  <button id="process_text_button" type="button" disabled>Read Aloud</button>
  <button id="clear_button" type="button" disabled>Clear Text</button>
  <button id="halt_button" type="button" disabled>Halt Processing</button>
  <audio id="audio_output" controls></audio>
  <p id="status_report">Please wait...</p>
</main>

<footer>
  <h2>How it works</h2>
  <p>
    Ron Reade uses advanced machine learning running right in your browser to convert text
    into natural-sounding speech. Your text stays private on your device.
  </p>
  <p><a href="https://github.com/martinmphil/ron_reade" target="_blank"
      rel="noopener noreferrer">Project on GitHub</a></p>
</footer>
`

setupRon(document.querySelector<HTMLDivElement>('ron')!)
