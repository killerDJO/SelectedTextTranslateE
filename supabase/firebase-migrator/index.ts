/* eslint-disable @typescript-eslint/no-explicit-any */
import * as admin from 'firebase-admin';
import * as fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database

const projectId = process.argv[2];
if (!projectId) {
  throw new Error('ProjectId must be provided');
}

const serviceAccountPath = process.argv[3];
if (!serviceAccountPath) {
  throw new Error('Path to a service account must be provided');
}

const supabaseProjectURL = process.argv[4];
if (!supabaseProjectURL) {
  throw new Error('supabaseProjectURL must be provided');
}

const supabaseAPIKey = process.argv[5];
if (!supabaseAPIKey) {
  throw new Error('supabaseAPIKey must be provided');
}

const userIdsMapString = process.argv[6];
if (!userIdsMapString) {
  throw new Error('userIdsMap must be provided');
}

const userIdsMap: Record<string, string> = userIdsMapString.split(',').reduce(
  (acc, pair) => {
    const [firebaseId, supabaseId] = pair.split(':');
    acc[firebaseId] = supabaseId;
    return acc;
  },
  {} as Record<string, string>
);
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${projectId}.firebaseio.com`
});

const db = admin.firestore();
const historyV2Collection = db.collection('history_v2');

const supabase = createClient(supabaseProjectURL, supabaseAPIKey);

executeMigration().catch(e => {
  console.error(e);
  process.exit(1);
});

async function executeMigration() {
  const supabaseRecords: any[] = [];

  const historyRecords = await historyV2Collection.get();
  for (const doc of historyRecords.docs) {
    const data = doc.data();

    if (!userIdsMap[data.user]) {
      continue;
    }

    supabaseRecords.push({
      // Remap ids to new format
      id: await generateId(data),
      // Remap user ids
      user_id: userIdsMap[data.user],
      sentence: data.sentence,
      forcedTranslation: data.isForcedTranslation,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      translate_result: data.translateResult,
      translations_number: data.translationsNumber,
      created_at: new Date(data.createdDate).toISOString(),
      updated_at: new Date(data.updatedDate).toISOString(),
      last_translated_date: new Date(data.lastTranslatedDate).toISOString(),
      last_modified_date: new Date(data.lastModifiedDate).toISOString(),
      starred: data.isStarred,
      archived: data.isArchived,
      tags: data.tags?.slice() ?? null,
      blacklisted_merge_records: data.blacklistedMergeRecords?.slice() ?? null,
      instances: data.instances
    });
  }

  const chunks = chunkArray(supabaseRecords, 100);

  console.log('Chunks:', chunks.length);
  let insertedChunks = 0;
  for (const chunk of chunks) {
    const insertResult = await supabase.from('history').insert(chunk);
    if (insertResult.error) {
      console.error(insertResult.error);
      break;
    }
    insertedChunks++;
    console.log(`Saved ${insertedChunks} of ${chunks.length} chunks`);
  }
}

async function generateId(descriptor: any): Promise<string> {
  const hash = await getHash(descriptor.sentence);
  return `${hash}${descriptor.isForcedTranslation ? '-forced' : ''}-${
    descriptor.sourceLanguage
  }-${descriptor.targetLanguage}`;
}

async function getHash(sentence: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(sentence);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  return arr.length > size ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)] : [arr];
}
