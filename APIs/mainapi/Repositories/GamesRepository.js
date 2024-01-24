'use strict';

const mongoClient = require('mongodb').MongoClient;

class UsersRepository {
    constructor() {
        this.mongoClient = null;
        this.gamesCollection = null;
    }

    async connect(url = 'mongodb://localhost:27017', database = 'Cards', collection = 'game') {
        this.mongoClient = await mongoClient.connect(url);
        const db = this.mongoClient.db(database);
        this.gamesCollection = db.collection(collection);
    }

    async disconnect() {
        if (this.mongoClient.connected) {
            await this.mongoClient.close();
            this.mongoClient = null;
            this.gamesCollection = null;
        }
    }

    async getById(gameId) {
        return await this.gamesCollection.findOne({_id: gameId});
    }

    async create(game) {
        try {
            await this.gamesCollection.insertOne(game);
            return 'OK';
        } catch (error) {
            return {error};
        }
    }

    async update(game) {
        try {
            await this.gamesCollection.updateOne({_id: game._id}, {$set: game});
            return 'OK';
        } catch (error) {
            return {error};
        }
    }

    async deleteById(gameId) {
        try {
            await this.gamesCollection.deleteOne({_id: gameId});
            return 'OK';
        } catch (error) {
            return {error};
        }
    }
}

module.exports = UsersRepository;