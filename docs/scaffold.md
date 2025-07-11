# Initial project scaffold

Installing `Vite` and `Vitest` built a scaffold for this project, and `JSDOM` facilitated unit testing HTML elements. Installing `@huggingface/transformers` as a development dependency gives typescript type safety but is not fully included in distribution bundles. 

## Typical scaffold
```bash
$ npm create vite@latest
Choose:- <your-project-name>; Vanilla; TypeScript.

$ cd <your-project-name>
$ npm install
$ npm run dev

$ npm install --save-dev vitest
$ npm install --save-dev jsdom
$ npm install --save-dev @types/jsdom
$ npm install --save-dev @huggingface/transformers
``` 
