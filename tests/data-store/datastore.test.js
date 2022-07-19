import { DataStore } from "../../data-store/datastore";
import { BlogSerialization } from "../../domain/blog";
import { DistributionSerialization } from "../../domain/distribution";
import { MarkovMatrixSerialization } from "../../domain/matrix";
import { jest } from '@jest/globals';

let dataStore;
let bs1, bs1prime, bs2;
let nullBlog;
let defaultURL;

jest.setTimeout(20000);

beforeEach(async () => {
    defaultURL = 'defaulttestblog';
    nullBlog = new BlogSerialization(defaultURL);
    
    bs1 = new BlogSerialization(
        'blog1',
        new Date().toISOString(),
        new MarkovMatrixSerialization(
            [
                {
                    prefix: 'ab',
                    dist: new DistributionSerialization(
                        [
                            {
                                char: 'a',
                                count: 1
                            },
                            {
                                char: 'b',
                                count: 2
                            }
                        ]
                    )
                }
            ]
        )
    );
    bs1prime = new BlogSerialization(
        'blog1',
        new Date().toISOString(),
        new MarkovMatrixSerialization(
            [
                {
                    prefix: 'ab',
                    dist: new DistributionSerialization(
                        [
                            {
                                char: 'a',
                                count: 1
                            },
                            {
                                char: 'b',
                                count: 2
                            }
                        ]
                    )
                },
                {
                    prefix: 'k',
                    dist: new DistributionSerialization(
                        [
                            {
                                char: 'k',
                                count: 10
                            }
                        ]
                    )
                }
            ]
        )
    );
    bs2 = new BlogSerialization(
        'blog2',
        new Date().toISOString(),
        new MarkovMatrixSerialization(
            [
                {
                    prefix: 'xy',
                    dist: new DistributionSerialization(
                        [
                            {
                                char: 'a',
                                count: 1
                            },
                            {
                                char: 'b',
                                count: 2
                            }
                        ]
                    )
                },
                {
                    prefix: 'z',
                    dist: new DistributionSerialization(
                        [
                            {
                                char: 'z',
                                count: 1
                            }
                        ]
                    )
                }
            ]
        )
    );
    dataStore = new DataStore(false);
    await dataStore.syncModels();
});

afterEach(async () => {
    await dataStore.database.drop();
    await dataStore.database.close();
});

test('Constructor and syncing work', () => {
    expect(dataStore.synced).toEqual(true);
});

test('Models exist and can find items', async () => {
    let blogs = await dataStore.Blog.findAll();
    let matrices = await dataStore.Matrix.findAll();
    let distributions = await dataStore.Distribution.findAll();
    let distributionPairs = await dataStore.DistributionPair.findAll();

    expect(blogs).toEqual([]);
    expect(matrices).toEqual([]);
    expect(distributions).toEqual([]);
    expect(distributionPairs).toEqual([]);
});

test('Retrieving a blog when none exists creates a new object', async () => {
    let blog = await dataStore.retrieveOrCreate(defaultURL);

    expect(blog).toEqual(nullBlog);
});

test('Saving blogs creates expected number of rows in database', async () => {
    await dataStore.createOrUpdate(bs1);
    await dataStore.createOrUpdate(bs2);

    let blogCount = (await dataStore.Blog.findAll()).length;
    let matrixCount = (await dataStore.Matrix.findAll()).length;
    let distributionCount = (await dataStore.Distribution.findAll()).length;
    let distributionPairCount = (await dataStore.DistributionPair.findAll()).length;

    expect(blogCount).toEqual(2);
    expect(matrixCount).toEqual(2);
    expect(distributionCount).toEqual(3);
    expect(distributionPairCount).toEqual(5);
});

test('Saved blogs match original items', async () => {
    await dataStore.createOrUpdate(bs1);
    await dataStore.createOrUpdate(bs2);

    let newbs1 = await dataStore.retrieveOrCreate(bs1.url);
    let newbs2 = await dataStore.retrieveOrCreate(bs2.url);

    expect(newbs1).toEqual(bs1);
    expect(newbs2).toEqual(bs2);
});

test('Retrieving a non-existant blog returns null even if other blogs exist', async () => {
    await dataStore.createOrUpdate(bs1);

    let blog = await dataStore.retrieveOrCreate(defaultURL);
    
    expect(blog).toEqual(nullBlog);
});

test('Updating a blog does not add duplicate rows', async () => {
    await dataStore.createOrUpdate(bs1);

    await dataStore.createOrUpdate(bs1prime);

    let blogCount = (await dataStore.Blog.findAll()).length;
    let matrixCount = (await dataStore.Matrix.findAll()).length;
    let distributionCount = (await dataStore.Distribution.findAll()).length;
    let distributionPairCount = (await dataStore.DistributionPair.findAll()).length;

    expect(blogCount).toEqual(1);
    expect(matrixCount).toEqual(1);
    expect(distributionCount).toEqual(2);
    expect(distributionPairCount).toEqual(3);
});

test('Updated blog reflects changes', async () => {
    await dataStore.createOrUpdate(bs1);

    await dataStore.createOrUpdate(bs1prime);

    let blog = await dataStore.retrieveOrCreate(bs1.url);

    expect(blog).toEqual(bs1prime);
});

test('Updating a blog does not change other blogs', async () => {
    await dataStore.createOrUpdate(bs1);
    await dataStore.createOrUpdate(bs2);

    await dataStore.createOrUpdate(bs1prime);

    let blog = await dataStore.retrieveOrCreate(bs2.url);

    expect(blog).toEqual(bs2);
});