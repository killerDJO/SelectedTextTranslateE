import { Message } from "./Message";

export function createMessage(name: string): Message {
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return {
        id: id,
        name: name,
    };
}