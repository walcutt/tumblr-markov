import { MarkovMatrix } from '../domain/matrix.js';
import { Assembler } from './assembler.js';
import { Dissector } from './dissector.js';
import fs from 'fs';
import { DataStore } from '../data-store/datastore.js';
import { BlogSerialization } from '../domain/blog.js';

// Entrypoint for backend application.
let PREFIX_DEPTH = 10;
let args = process.argv.slice(2);

let datastore = new DataStore(true);
await datastore.syncModels();
console.log('Persistent datastore authenticated successfully.');
console.log('------------------------------------------------');

if(args.length === 1) {
    if(args[0].toLowerCase() === 'reset') {
        console.log(`Reseting data for all blogs`);
        await datastore.database.drop();
        process.exit(0);
    } else {
        console.error(`Expected at least 2 arguments, if not resetting. Please include a url and any relevant files.`);
        process.exit(1);
    }
} else if(args.length < 2) {
    console.error(`Expected at least 2 arguments, but found ${args.length}. Please include a command (dissect, assemble, reset), a url if dissecting or assembling, plus one or more paths to text inputs if dissecting.`);
    process.exit(1);
}

let command = args[0];
let blogURL = args[1];
let files = args.slice(2);

let blog = await datastore.retrieveOrCreate(blogURL);
if(command.toLowerCase() === 'dissect') {
    let dissector = new Dissector(PREFIX_DEPTH, blog.matrix);
    files.forEach(
        (file, index) => {
            console.log(`Dissecting ${file} (${index + 1} / ${files.length})`);
            let text = fs.readFileSync(file).toString('utf-8');
            dissector.dissectText(text);
        }
    );

    blog.matrix = dissector.matrix.serialize();
    console.log(`Saving blog "${blogURL}" after dissecting ${files.length} file${files.length !== 1 ? 's' : ''}.`);
    await datastore.createOrUpdate(blog);
} else {
    let assembler = new Assembler(PREFIX_DEPTH, blog.matrix.deserialize());
    console.log(assembler.generate());
}