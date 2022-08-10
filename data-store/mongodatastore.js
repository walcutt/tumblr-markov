import { MongoClient } from 'mongodb';
import { BlogSerialization } from '../domain/blog.js';
import { ITERATIONS_MAX } from '../domain/constants.js';

export class MongoDataStore {

    //string
    uri;
    //string
    dbName;

    //MongoClient
    client;
    //MongoDB
    database;
    //MongoCollection
    blogs;

    //boolean
    synced;

    constructor(uri, dbName) {
        this.uri = uri;
        this.dbName = dbName;

        this.client = new MongoClient(this.uri);
        this.synced = false;
    }

    async init() {
        await this.client.connect();
        this.database = this.client.db(this.dbName);
        this.blogs = this.database.collection('Blogs');
    }

    async getBlog(url) {
        let blog = await this.blogs.findOne({
            url: url
        });

        return blog ?? new BlogSerialization(url);
    }

    async saveBlog(blogSerialization) {
        await this.blogs.replaceOne(
            {
                url: blogSerialization.url
            },
            blogSerialization,
            {
                upsert: true
            }
        );
    }

    async drop() {
        await this.blogs.deleteMany({});
    }

    async close() {
        await this.client.close();
    }
}