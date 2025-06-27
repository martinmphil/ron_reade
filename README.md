# Ron Reade 
Realistic Text-To-Speech in a browser with local neural networks. 

## Summary 
Ron Reade is a text-to-speech web app that reads text aloud to a user. Users enter text into the web app. Then a small machine-learning system running locally in a web browser converts the user's text into audio. The app then verbalises the user's text as an audio stream outputted directly in the web browser with realistic speech patterns with natural cadence. 

Ron Reade uses small machine-learning models from [Xenova](https://github.com/xenova) called [speecht5_tts](https://huggingface.co/Xenova/speecht5_tts). The model runs locally in the browser using the [Transformers.js](https://github.com/huggingface/transformers.js) library from [Hugging Face](https://huggingface.co/). This app employs a machine-learning encoder-decoder methodology followed by a HiFi-GAN (High-Fidelity Generative Adversarial Network) vocoder process to convert text to speech. 

This project employs HTML, CSS, TypeScript, [Vite](https://en.wikipedia.org/wiki/Vite_(software)) and [Vitest](https://vitest.dev/). 

## Audio samples 
The text-to-speech pipeline creates an audio buffer object (ie audio chunk). 
This audio chunk object has an `audio` property which holds the audio waveform data in a Float32Array as an audio sample. 
eg 
```
{
  audio: Float32Array(10240) [
    -0.000004008579253422795,
    0.0005253833951428533,
    ... 10238 more items
  ],
  sampling_rate: 16000
}
```

## AI assist
Creating this web app involved collaboration with machine learning systems including [Google Gemini](https://gemini.google.com/), [perplexity.ai](https://www.perplexity.ai/), [claude.ai](https://claude.ai) and [windsurf](https://windsurf.com/). 

## External licenses
[Hugging Face](https://huggingface.co/) released the transformers.js under an Apache 2.0 License. The base models of [speecht5_tts](https://huggingface.co/microsoft/speecht5_tts) and the [speecht5_hifigan](https://huggingface.co/microsoft/speecht5_hifigan) vocoder are released under an MIT license. 

## References 

### Xenova 
[github.com/xenova](https://github.com/xenova) 

[huggingface.co/Xenova/speecht5_tts](https://huggingface.co/Xenova/speecht5_tts) 

[huggingface.co/Xenova/speecht5_hifigan](https://huggingface.co/Xenova/speecht5_hifigan) 

### Thorsten Voice 
[thorsten-voice.de/en/](https://thorsten-voice.de/en/) 

### Transformers.js 
[github.com/huggingface/transformers.js](https://github.com/huggingface/transformers.js) 

### Hugging Face 
[huggingface.co/microsoft/speecht5_tts](https://huggingface.co/microsoft/speecht5_tts) 
