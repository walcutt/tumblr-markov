import { MongoDataStore } from '../../data-store/mongodatastore.js';
import { BlogSerialization } from '../../domain/blog.js';
import { MarkovMatrixSerialization } from '../../domain/matrix.js';
import { DistributionSerialization } from '../../domain/distribution.js';

let datastore;

let url1, url2, urlNull;
let blog1, blog2, blogNull;
let blog1prime;

beforeAll(async () => {
    datastore = new MongoDataStore(globalThis.__MONGO_URI__, globalThis.__MONGO_DB_NAME__);

    await datastore.init();

    url1 = 'test1';
    url2 = 'test2';
    urlNull = 'notfound';

    blog1 = new BlogSerialization(
        url1,
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

    blog2 = new BlogSerialization(
        url2,
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

    blogNull = new BlogSerialization(
        urlNull
    );

    blog1prime = new BlogSerialization(
        url1,
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
});

afterEach(async () => {
    await datastore.drop();
});

afterAll(async () => {
    await datastore.close();
});

test('Constructor and syncing work.', () => {
    expect(datastore.synced).toEqual(true);
});

test('Retrieving a blog when none exists creates a new object', async () => {
    let blog = await datastore.getBlog(urlNull);

    expect(blog).toEqual(blogNull);
});

test('Saving blogs creates expected number of documents in database', async () => {
    await datastore.saveBlog(blog1);
    await datastore.saveBlog(blog2);

    let docCount = await datastore.blogs.countDocuments({});

    expect(docCount).toEqual(2);
});

test('Saved blogs match original items', async () => {
    await datastore.saveBlog(blog1);
    await datastore.saveBlog(blog2);

    let newb1 = await datastore.getBlog(url1);
    let newb2 = await datastore.getBlog(url2);

    expect(newb1).toEqual(blog1);
    expect(newb2).toEqual(blog2);
});

test('Retrieving a non-existant blog returns null even if other blogs exist', async () => {
    await datastore.saveBlog(blog1);

    let blog = await datastore.getBlog(urlNull);

    expect(blog).toEqual(blogNull);
});

test('Updating a blog does not add duplicate documents', async () => {
    await datastore.saveBlog(blog1);

    await datastore.saveBlog(blog1prime);

    let docCount = await datastore.blogs.countDocuments({});

    expect(docCount).toEqual(1);
});

test('Updated blog reflects changes', async () => {
    await datastore.saveBlog(blog1);

    await datastore.saveBlog(blog1prime);

    let blog = await datastore.getBlog(url1);

    expect(blog).toEqual(blog1prime);
});

test('Updating a blog does not change other blogs', async () => {
    await datastore.saveBlog(blog1);
    await datastore.saveBlog(blog2);

    await datastore.saveBlog(blog1prime);

    let blog = await datastore.getBlog(url2);

    expect(blog).toEqual(blog2);
});