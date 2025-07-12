import admin from 'firebase-admin';

// Lese den Base64-kodierten Schlüssel aus der Umgebungsvariable
const privateKeyBase64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;

// Dekodiere den Schlüssel und setze ihn wieder in das PEM-Format zusammen


const privateKey = Buffer.from(privateKeyBase64!, 'base64')
  .toString('utf8')
  .replace(/\\n/g, '\n');


const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: privateKey, // Verwende den dekodierten und zusammengesetzten Schlüssel
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
