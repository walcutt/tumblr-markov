import sequelize from 'sequelize';
import { Sequelize, DataTypes } from 'sequelize';
import { BlogSerialization } from '../domain/blog.js';
import { DistributionSerialization } from '../domain/distribution.js';
import { MarkovMatrixSerialization } from '../domain/matrix.js';
import dotenv from 'dotenv';
dotenv.config();

const ITERATIONS_MAX = 20;

export class DataStore {
    //Sequelize
    database;
    
    //data types.
    Blog;
    Matrix;
    Distribution;
    DistributionPair;

    //boolean
    synced;

    //note: must sync() after constructing.
    constructor(usePersistent = true, logging = false) {
        if(usePersistent) {
            this.database = new Sequelize({
                dialect: 'sqlite',
                storage: './db-files/db_volumes/sqlite/db.sqlite',
                logging: logging
            });
        } else {
            this.database = new Sequelize('sqlite::memory:', { logging: logging });
        }

        this.registerModels();
    }

    registerModels() {
        this.registerBlog();
        this.registerMatrix();
        this.registerDistribution();
        this.registerDistributionPair();
        this.registerAssociations();
    }

    registerBlog() {
        this.Blog = this.database.define('Blog', {
            url: {
                type: DataTypes.STRING,
                allowNull: false
            },
            latest_updated_date: {
                type: DataTypes.DATE
            }
        });
    }

    registerMatrix() {
        this.Matrix = this.database.define('Matrix', {
            // No first-class information here.
            // This is more of a join table for blogs and distributions at the moment.
        });
    }

    registerDistribution() {
        this.Distribution = this.database.define('Distribution', {
            prefix: {
                type: DataTypes.STRING,
                allowNull: false
            }
        });
    }

    registerDistributionPair() {
        this.DistributionPair = this.database.define('DistributionPair', {
            character: {
                type: DataTypes.CHAR,
                allowNull: false
            },
            count: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        });
    }

    registerAssociations() {
        this.Blog.hasOne(this.Matrix);
        this.Matrix.belongsTo(this.Blog, {
            foreignKey: {
                type: DataTypes.UUID
            }
        });

        this.Matrix.hasMany(this.Distribution, {
            foreignKey: {
                type: DataTypes.UUID
            }
        });
        this.Distribution.belongsTo(this.Matrix);

        this.Distribution.hasMany(this.DistributionPair, {
            foreignKey: {
                type: DataTypes.UUID
            }
        });
        this.DistributionPair.belongsTo(this.Distribution);
    }

    async syncModels() {
        await this.databaseIsReady();
        await this.Blog.sync();
        await this.Matrix.sync();
        await this.Distribution.sync();
        await this.DistributionPair.sync();
        this.synced = true;
    }

    async databaseIsReady() {
        let sleep = () => new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, 1000)
        });

        let iterations = 0;
        
        while(iterations < ITERATIONS_MAX) {
            try {
                await this.database.authenticate();
                return;
            } catch (e) {
                iterations++;
                await sleep();
            }
        }

        throw new Error(`Database did not accept connection within ${ITERATIONS_MAX} seconds. Make sure it is running correctly, and configurations are correct.`);
    }

    async retrieveOrCreate(blogURL) {
        if(!this.synced) {
            throw new Error(`Cannot retrieve blog ${blogURL}. Data store is not properly synced!`);
        }
        let blog = await this.Blog.findOne({
            where: {
                url: blogURL
            },
            include: {
                all: true,
                nested: true
            }
        });
        if(blog === null) {
            return new BlogSerialization(blogURL);
        }

        return new BlogSerialization(
            blog.url,
            blog.latest_updated_date.toISOString(),
            this.createMatrixSerialization(blog.Matrix)
        );
    }

    createMatrixSerialization(matrix) {
        let matrixArray = matrix.Distributions.map(
            dist => {
                return {
                    prefix: dist.prefix,
                    dist: this.createDistributionSerialization(dist)
                }
            },
            this
        );
        return new MarkovMatrixSerialization(matrixArray);
    }

    createDistributionSerialization(distribution) {
        let pairs = distribution.DistributionPairs.map(
            pair => {
                return {
                    char: pair.character,
                    count: pair.count
                }
            }
        );

        return new DistributionSerialization(pairs);
    }

    async createOrUpdate(blogSerialization) {
        if(!this.synced) {
            throw new Error(`Cannot save blog ${blogSerialization.url}. Data store is not properly synced!`);
        }
        let blogDBObject = await this.Blog.findOne({
            where: {
                url: blogSerialization.url
            }
        });
        if(blogDBObject === null) {
            await this.create(blogSerialization);
        } else {
            await this.update(blogSerialization);
        }
    }

    async create(blogSerialization) {
        try {
            await this.database.transaction(async (t) => {
                let blog = await this.Blog.create(
                    {
                        url: blogSerialization.url,
                        latest_updated_date: blogSerialization.dateString
                    },
                    {
                        transaction: t
                    }
                );
                let matrix = await blog.createMatrix(
                    {

                    },
                    {
                        transaction: t
                    }
                );

                let matrixArray = blogSerialization.matrix.matrix;
                for(let i = 0; i < matrixArray.length; i++) {
                    let distribution = await matrix.createDistribution(
                        {
                            prefix: matrixArray[i].prefix
                        },
                        {
                            transaction: t
                        }
                    );

                    let distArray = matrixArray[i].dist.frequencies;
                    for(let k = 0; k < distArray.length; k++) {
                        let pair = await distribution.createDistributionPair(
                            {
                                character: distArray[k].char,
                                count: distArray[k].count
                            },
                            {
                                transaction: t
                            }
                        );
                    }
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    async update(blogSerialization) {
        try {
            await this.database.transaction(async (t) => {
                let blog = await this.Blog.findOne(
                    {
                        where: {
                            url: blogSerialization.url
                        }
                    }
                );
                blog.latest_updated_date = blogSerialization.dateString;
                await blog.save(
                    {
                        transaction: t
                    }
                );

                let matrix = await blog.getMatrix();

                let matrixArray = blogSerialization.matrix.matrix;
                for(let i = 0; i < matrixArray.length; i++) {
                    let matchingDistributions = await matrix.getDistributions(
                        {
                            where: {
                                prefix: matrixArray[i].prefix
                            }
                        }
                    );
                    let distribution = matchingDistributions[0] ?? await matrix.createDistribution({ prefix: matrixArray[i].prefix }, { transaction: t });
                    let distributionArray = matrixArray[i].dist.frequencies;
                    for(let k = 0; k < distributionArray.length; k++) {
                        let matchingPairs = await distribution.getDistributionPairs(
                            {
                                where: {
                                    character: distributionArray[k].char
                                }
                            }
                        );
                        let pair = matchingPairs[0] ?? await distribution.createDistributionPair({ character: distributionArray[k].char, count: distributionArray[k].count}, { transaction: t });
                        pair.count = distributionArray[k].count;
                        await pair.save(
                            {
                                transaction: t
                            }
                        );
                    }
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
}