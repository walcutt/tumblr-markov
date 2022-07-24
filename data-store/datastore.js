import { BlogSerialization } from '../domain/blog.js';
import { DistributionSerialization } from '../domain/distribution.js';
import { MarkovMatrixSerialization } from '../domain/matrix.js';
import { BaseDataStore  } from './basedatastore.js';

export class DataStore extends BaseDataStore {

    constructor(usePersistent = true, logging = false) {
        super(usePersistent, logging);
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