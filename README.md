# Ron Reade 
Realistic Text-To-Speech in a browser with local neural networks. 

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

## References 

### Xenova 
[huggingface.co/Xenova/speecht5_tts](https://huggingface.co/Xenova/speecht5_tts) 

[github.com/xenova](https://github.com/xenova) 

### Thorsten Voice 
[thorsten-voice.de/en/](https://thorsten-voice.de/en/) 

### Transformers.js 
[github.com/huggingface/transformers.js](https://github.com/huggingface/transformers.js) 

### Hugging Face 
[huggingface.co/microsoft/speecht5_tts](https://huggingface.co/microsoft/speecht5_tts) 
