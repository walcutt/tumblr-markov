import { Assembler } from '../backend/assembler.js';
import { DataStore } from '../data-store/datastore.js';

let args = process.argv.slice(2);

if(args.length !== 1) {
    console.error(`Expected 1 parameter, but received ${args.length}.`);
    console.error(`Proper usage is: npm run assemble <blog url>`);
    process.exit(1);
}

let PREFIX_DEPTH = 10;

let blogURL = args[0];

let datastore = new DataStore();
await datastore.syncModels();
console.log('Persistent datastore authenticated successfully.');
console.log();

console.log(`Retrieving data for ${blogURL}`);
let blog = await datastore.retrieveOrCreate(blogURL);

console.log('Generating post.');
console.log('----------------');

let assembler = new Assembler(PREFIX_DEPTH, blog.matrix.deserialize());
console.log(assembler.generate());