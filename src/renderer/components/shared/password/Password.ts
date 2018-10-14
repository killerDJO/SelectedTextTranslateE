import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Password extends Vue {
    @Prop(String)
    public value!: string;

    public showPassword: boolean = false;

    public get value$(): string {
        return this.value;
    }

    public set value$(value: string) {
        this.$emit("update:value", value);
    }
}