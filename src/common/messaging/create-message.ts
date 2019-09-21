import { Message } from "./Message";

export function createMessage(name: string): Message {
    // tslint:disable-next-line no-magic-numbers
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return {
        id: id,
        name: name,
    };
}