import { MarkovMatrix } from '../domain/matrix.js';
import { Assembler } from './assembler.js';
import { Dissector } from './dissector.js';
import fs from 'fs';
import { DataStore } from '../data-store/datastore.js';

// Entrypoint for backend application.

let datastore = new DataStore(true);
await datastore.syncModels();
console.log('Persistent datastore authenticated successfully.');