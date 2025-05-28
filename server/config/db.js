const { MongoClient } = require('mongodb')


let dbInstance = null; 


async function connectDB()  {

    if (dbInstance) return dbInstance; 

    try {
        const client = new MongoClient(process.env.MONGODB_URI, {
            useNewUrlParser: true, 
            useUnifiedTopology: true
        });

        await client.connect();
        dbInstance = client.db(process.env.DB_NAME || 'profileApp');
        console.log("Database Connected!")
        return dbInstance   ;

    }
    catch (err){
        console.log(`Error: ${err.message}`);
        process.exit(1);
    }
};


function getDB() { 
    if (!dbInstance) throw new Error('Database not initialized.');
    return dbInstance; 
}

const closeConnection = async () => {
    if (client){
        await client.close();
    }
};

module.exports = { connectDB, closeConnection, getDB, getClient: () => client };