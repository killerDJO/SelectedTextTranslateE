import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class ValidatedField extends Vue {
    @Prop(String)
    public validationMessage!: string | null;

    public get hasValidationMessage(): boolean {
        return this.validationMessage !== null;
    }
}