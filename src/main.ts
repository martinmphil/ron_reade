import './style.css'
import { setupRon } from './ron.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header>
  <p>Text-To-Speech via <a
      href="https://huggingface.co/docs/transformers.js/index">Transformers.js</a></p>
</header>

<main>
  <h1>Ron Reade</h1>
  <p><label for="ronText">Enter text:</label></p>
  <textarea name="ronText" id="ronText" rows="20" cols="33">Know thyself</textarea>
  <button id="speak-button" type="button">Read Aloud</button>
  <button id="clear-button" type="button">Clear Text</button>
  <audio id="audio-output" controls></audio>
  <p id="statusReport">Please wait...</p>
  <hr>
</main>

<footer>
  <p><a href="https://github.com/martinmphil/ron_reade" target="_blank"
      rel="noopener noreferrer">Project on GitHub</a></p>
</footer>
`

setupRon(document.querySelector<HTMLDivElement>('ron')!)
