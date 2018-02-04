import { Component, Prop, Vue } from "vue-property-decorator";
import { ipcRenderer } from "electron"

@Component
export default class TranslationResult extends Vue {

    text: string = "";

    constructor() {
        super();
        ipcRenderer.on("translate-result", (sender: Electron.EventEmitter, translateResult: string[]) => {
            this.updateTranslateResult(translateResult[0]);
        })
    }

    updateTranslateResult(text: string): void {
        this.text = text;
    }
}