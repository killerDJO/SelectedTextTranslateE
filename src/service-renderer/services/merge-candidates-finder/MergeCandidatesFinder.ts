import { HistoryRecord } from "common/dto/history/HistoryRecord";
import { MergeCandidate } from "common/dto/history/MergeCandidate";
import { MessageBus } from "common/renderer/MessageBus";
import { Messages } from "common/messaging/Messages";
import Worker = require("worker-loader!./MergeCandidatesFinder.worker");

export class MergeCandidatesFinder {
    private readonly messageBus: MessageBus = new MessageBus();

    constructor() {
        this.messageBus.observeValue<HistoryRecord[], ReadonlyArray<MergeCandidate>>(Messages.ServiceRenderer.MergeCandidates, records => {
            const worker = new Worker();
            worker.postMessage(records);
            return new Promise((resolve, reject) => {
                worker.onmessage = (event) => {
                    resolve(event.data);
                    worker.terminate();
                };
                worker.onerror = (error) => {
                    reject(error);
                    worker.terminate();
                };
            });
        });
    }
}