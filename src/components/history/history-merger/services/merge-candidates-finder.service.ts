import type { HistoryRecord } from '~/components/history/models/history-record.model';
import type { MergeCandidate } from '~/components/history/history-merger/models/merge-candidate.model';

export class MergeCandidatesFinder {
  public getMergeCandidates(records: HistoryRecord[]): Promise<ReadonlyArray<MergeCandidate>> {
    const worker = new Worker(new URL('./merge-candidates-finder.worker.ts', import.meta.url), {
      type: 'module'
    });
    worker.postMessage(records);
    return new Promise((resolve, reject) => {
      worker.onmessage = event => {
        resolve(event.data);
        worker.terminate();
      };
      worker.onerror = error => {
        reject(error);
        worker.terminate();
      };
    });
  }
}

export const mergeCandidatesFinder = new MergeCandidatesFinder();
