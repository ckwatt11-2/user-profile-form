const { getDB } = require('../config/db');

const userModel = {
    async usernameExists(username){
        const db = getDB();
        return db.collection('users').findOne({ username });
    },

    async createUser(userData){
        const db = getDB();
        const result = await db.collection('users').insertOne(userData);
        return result.insertedId; 
    },

    async updateUser(userId, updateData){

        const db = getDB();
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData}
        );

        return result.modifiedCount; 
    },

    async getUserById(userId) {

        const db = getDB();
        return db.collection('users').findOne({ _id: new ObjectId(userId) });
    }
    
};

module.exports = userModel;