import { MarkovMatrix } from '../domain/matrix.js';
import { Assembler } from './assembler.js';
import { Dissector } from './dissector.js';
import fs from 'fs';

// Entrypoint for backend application.

let args = process.argv.slice(2);
let prefixLength = 20;

let dissector = new Dissector(prefixLength);

args.forEach(
    (arg, index) => {
        console.log(`Dissecting ${arg} (${index + 1}/${args.length})`);
        let text = fs.readFileSync(arg).toString('utf-8');
        dissector.dissectText(text);
    }
);

console.log('Assembling text....');
console.log('-------------------');
let assembler = new Assembler(prefixLength, dissector.matrix);
console.log(assembler.generate());
