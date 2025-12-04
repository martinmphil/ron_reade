# Active Tasks

## Browser Compatibility
Test webpage with recent versions of Firefox, Safari and Chrome. 


# Backlog (Future Tasks)

## Review Requirements 
Systematically check each requirement is met.

## Review Type
Minimise the use to the `any` type.

## File Download
Make the completed audio file available for download.


# Completed Tasks

## Requirements
First draft of `requirements.md` 

## Design Overview
First draft of `design.md`

## Initial project scaffold

Install `Vite` and `Vitest` to build a project scaffold. 

Install `JSDOM` to facilitate unit testing HTML elements. 

Install `@huggingface/transformers` as a development dependency for typescript type safety, but exclude large model files from app distribution bundles. 

### Scaffold Commands
```bash
$ npm create vite@latest
```
Choose:- <your-project-name>; Vanilla; TypeScript.

```bash
$ npm install --save-dev vitest
$ npm install --save-dev jsdom
$ npm install --save-dev @types/jsdom
$ npm install --save-dev @huggingface/transformers
```

## Speaker Embeddings
Add speaker `embeddings` to `ron_reade2/public/speaker_embeddings.bin`

## Main HTML Tag
Create `src/main.tx` as a placeholder for HTML main tag. 

## UI Skeleton
Update `index.html` with semantic structure. 
Create `src/style.css` with Premium design. 
Create `src/main.ts` entry point

## Text Chunking
Write unit tests for text chunking
Implement text chunking

## Core Logic
Define types in `src/state.ts`
Write unit tests for state reducer
Implement state reducer

## Voicing Web Worker
Write unit tests for voicing web worker
Implement voicing web worker

## Voicing Web Worker
Write unit tests for voicing web worker
Implement voicing web worker

## Audio Encoder
Write unit tests for `.wav` encoder
Implement `.wav` encoder

## UI Manager
Write unit tests for UI Manager
Implement UI Manager

## Update `main.ts`
Update and manually test app end-to-end
