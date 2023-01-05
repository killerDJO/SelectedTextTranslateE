import * as admin from 'firebase-admin';
import * as fs from 'fs';

const projectId = process.argv[2];
if (!projectId) {
  throw new Error('ProjectId must be provided');
}

const serviceAccountPath = process.argv[3];
if (!serviceAccountPath) {
  throw new Error('Path to a service account must be provided');
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${projectId}.firebaseio.com`
});

const db = admin.firestore();
const historyCollection = db.collection('history');
const historyV2Collection = db.collection('history_v2');

executeMigration().then(() => process.exit());

async function executeMigration() {
  const updates: Promise<void>[] = [];
  let recordsSaved = 0;

  const historyRecords = await historyCollection.get();
  historyRecords.docs.forEach(doc => {
    const recordData = doc.data();
    const record = JSON.parse(decodeURIComponent(escape(atob(doc.data().record))));
    delete record.id;

    updates.push(
      (async function () {
        await historyV2Collection.doc(doc.id).set({
          user: recordData.user,
          ...record,
          createdDate: ensureUnixDate(record.createdDate),
          updatedDate: ensureUnixDate(record.updatedDate),
          lastTranslatedDate: ensureUnixDate(record.lastTranslatedDate),
          lastModifiedDate: ensureUnixDate(record.lastModifiedDate)
        });
        console.log(`Saved ${++recordsSaved} ouf of ${historyRecords.docs.length}`);
      })()
    );
  });

  await Promise.all(updates);
}

function ensureUnixDate(date: string | number | undefined) {
  if (typeof date === 'number') {
    return date;
  }

  if (typeof date === 'string') {
    return new Date(date).getTime();
  }

  return new Date('2000-01-01'); // Fallback just in case
}
