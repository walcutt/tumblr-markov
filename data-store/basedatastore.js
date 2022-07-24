import { Sequelize, DataTypes } from 'sequelize';
import { ITERATIONS_MAX } from '../domain/constants.js';

export class BaseDataStore {

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
}