import { Dissector } from '../backend/dissector.js';
import { DataStore } from '../data-store/datastore.js';
import fs from 'fs';
import { MAX_PREFIX_DEPTH, MIN_PREFIX_DEPTH } from '../domain/constants.js';

let args = process.argv.slice(2);

if(args.length < 2) {
    console.error(`Expected at least 2 parameters, but only received ${args.length}.`);
    console.error(`Proper usage is: npm run dissect <blog url> <path to file 1> <path to file 2> ... <path to file n>`);
    process.exit(1);
}

let blogURL = args[0];
let files = args.slice(1);

let datastore = new DataStore();
await datastore.syncModels();
console.log('Persistent datastore authenticated successfully.');

console.log(`Retrieving existing data for ${blogURL}`);
let blog = await datastore.retrieveOrCreate(blogURL);

let dissector = new Dissector(MIN_PREFIX_DEPTH, MAX_PREFIX_DEPTH, blog.matrix);

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