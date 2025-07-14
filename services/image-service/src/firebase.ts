import admin from 'firebase-admin';

const decoded = JSON.parse(
  Buffer.from(process.env.FIREBASE_CREDENTIAL_BASE64!, 'base64').toString('utf8')
);


admin.initializeApp({
  credential: admin.credential.cert(decoded),
});

export default admin;
