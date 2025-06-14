import { MongoClient, Db } from 'mongodb';

// Nutze die Umgebungsvariable oder fallback
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'images';

const client = new MongoClient(uri);
let db: Db;

export const connectDB = async () => {
  try {
    console.log(`Verbindung zu MongoDB: ${uri}`);
    await client.connect();
    db = client.db(dbName);
    console.log('MongoDB verbunden');
    return db;
  } catch (error) {
    console.error('MongoDB Verbindungsfehler:', error);
    process.exit(1);
  }
};

// Dieses Objekt wird in den Routen verwendet
export const mongo = {
  collection: (name: string) => {
    if (!db) {
      throw new Error('Keine Datenbankverbindung. connectDB() muss zuerst aufgerufen werden.');
    }
    return db.collection(name);
  }
};
