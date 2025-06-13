import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let db: Db;

export async function connectDB() {
  try {
    await client.connect();
    db = client.db('webshop'); // wähle DB
    console.log('✅ MongoDB verbunden');
  } catch (error) {
    console.error('❌ Fehler beim MongoDB-Connect', error);
    process.exit(1);
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('❗️Datenbank nicht verbunden');
  }
  return db;
}
