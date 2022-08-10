import { MongoDataStore } from '../data-store/mongodatastore.js';
import { BlogSerialization } from '../domain/blog.js';
import { DEFAULT_POST_DATE } from '../domain/constants.js';
import { MarkovMatrixSerialization } from '../domain/matrix.js';

console.log('Creating datastore object');
let datastore = new MongoDataStore('mongodb://localhost:27017', 'test');
console.log('Datastore created successfully.');
console.log();

console.log('Initializing datastore.');
await datastore.init();
console.log('Datastore initialized.');
console.log();

console.log('Retrieving missing instance.');
let blog = await datastore.getBlog('test');
console.log('Instance retrieved:');
console.dir(blog);
console.log();

let mms = new MarkovMatrixSerialization(
    [1, 2, 3]
);
let blog2 = new BlogSerialization('test2', DEFAULT_POST_DATE.toISOString(), mms);
console.log('Writing blog instance');
await datastore.saveBlog(blog2);
console.log('Blog saved.');
console.log();

console.log('Retrieving existing instance');
let blog3 = await datastore.getBlog('test2');
console.log('Instance Retrieved');
console.dir(blog3);
console.log();

console.log('Clearing table');
await datastore.drop();
console.log('Table cleared');
console.log();

console.log('Closing datastore.');
await datastore.close();
console.log('Datastore closed.');