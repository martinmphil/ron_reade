# Hosting model files on app server 

When currently using the Ron Reade web app, a user's web browser downloads from hugging-face content-delivery-network (CDN). Alternatively this app could be constructed to host model files locally. 

## JavaScript exemplar

The following code indicates how a simple script might access local models from the `transformers.js` default model directory `/models/`.

```js
import { pipeline, env } from './assets/hugging-face/transformers.min.js';

env.allowLocalModels = true;
env.allowRemoteModels = false;

const ronReadeForm = document.getElementById('ronReadeForm');
const ronSubmitButton = ronReadeForm.querySelector('button[type="submit"]');
ronSubmitButton.disabled = true;
const playButon = document.getElementById('playButton');

// Load model
const orator = await pipeline('text-to-speech', 'Xenova/speecht5_tts',
  { dtype: 'fp32' });
ronSubmitButton.disabled = false;

async function generateAudioChunk(text) {
  const speaker_embeddings = './assets/speaker_embeddings.bin';
  const audioChunk = await orator(text, { speaker_embeddings });
  return audioChunk
}

function convertAudioChunk(audioChunk) {
  const audioCtx = new AudioContext();
  const bufferSource = audioCtx.createBufferSource();
  const buffer = audioCtx.createBuffer(1, audioChunk.audio.length, audioChunk.sampling_rate);
  buffer.copyToChannel(audioChunk.audio, 0);
  bufferSource.buffer = buffer;
  bufferSource.connect(audioCtx.destination);

  bufferSource.onended = () => {
    playButon.disabled = true;
    ronSubmitButton.disabled = false;
  };
  return bufferSource;
}

let source

ronSubmitButton.addEventListener('click', async (event) => {
  event.preventDefault();
  ronSubmitButton.disabled = true;
  const ronText = document.getElementById('ronText').value;
  const audioChunk = await generateAudioChunk(ronText);
  source = convertAudioChunk(audioChunk);
  playButon.disabled = false;

})

playButon.addEventListener('click', () => {
  source.start();
})
```

## Sizeable files

Although comparatively small by machine-learning standards, the encoder and decoder models in this project are ~343MB and ~245MB respectively. Hence this repository excludes all model files. To change this `Vite` app from using hugging-face content-delivery-network and instead serve the required models from the same web server as the app, then consider changing the transformers.js environment in the `loadModel()` function and copying the appropriate files from the following repositories to reproduce the file structure listed blow. 

[huggingface.co/Xenova/speecht5_tts](https://huggingface.co/Xenova/speecht5_tts) 

[huggingface.co/Xenova/speecht5_hifigan](https://huggingface.co/Xenova/speecht5_hifigan) 

```
`-- public
    |-- models
    |   `-- Xenova
    |       |-- speecht5_hifigan
    |       |   |-- config.json
    |       |   |-- gitattributes
    |       |   `-- onnx
    |       |       `-- model.onnx
    |       `-- speecht5_tts
    |           |-- added_tokens.json
    |           |-- config.json
    |           |-- generation_config.json
    |           |-- gitattributes
    |           |-- onnx
    |           |   |-- decoder_model_merged.onnx
    |           |   `-- encoder_model.onnx
    |           |-- preprocessor_config.json
    |           |-- quantize_config.json
    |           |-- special_tokens_map.json
    |           |-- spm_char.model
    |           |-- tokenizer_config.json
    |           `-- tokenizer.json
    `-- speaker_embeddings.bin
```
