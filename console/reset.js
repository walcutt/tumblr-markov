import { DataStore } from '../data-store/datastore.js';

let datastore = new DataStore();
await datastore.syncModels();
console.log('Persistent datastore authenticated successfully.');
console.log();

console.log('Deleting all records....');
await datastore.database.drop();
console.log('Records have been reset.');