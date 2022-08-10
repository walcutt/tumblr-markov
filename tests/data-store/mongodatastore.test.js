import { MongoDataStore } from '../../data-store/mongodatastore.js';

let datastore;

beforeAll(async () => {
    datastore = new MongoDataStore(globalThis.__MONGO_URI__, globalThis.__MONGO_DB_NAME__);

    await datastore.init();
});

afterAll(async () => {
    await datastore.drop();

    await datastore.close();
});

test('Constructor and syncing work.', () => {
    expect(datastore.synced).toEqual(true);
});