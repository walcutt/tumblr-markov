import { BaseDataStore } from '../../data-store/basedatastore.js';

let datastore;

beforeEach(async () => {
    datastore = new BaseDataStore(false);
    await datastore.syncModels();
});

afterEach(async () => {
    await datastore.database.drop();
    await datastore.database.close();
});

test('Constructor and syncing work', () => {
    expect(datastore.synced).toEqual(true);
});

test('Models exist and can find items', async () => {
    let blogs = await datastore.Blog.findAll();
    let matrices = await datastore.Matrix.findAll();
    let distributions = await datastore.Distribution.findAll();
    let distributionPairs = await datastore.DistributionPair.findAll();

    expect(blogs).toEqual([]);
    expect(matrices).toEqual([]);
    expect(distributions).toEqual([]);
    expect(distributionPairs).toEqual([]);
});