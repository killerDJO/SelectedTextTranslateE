declare module "speaker" {
    import { Writable } from "stream";

    class Speaker extends Writable {
        constructor(...args: any[]);
    }

    export = Speaker;
}