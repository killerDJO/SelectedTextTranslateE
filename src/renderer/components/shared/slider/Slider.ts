import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Slider extends Vue {
    @Prop(Number)
    public minValue!: number;

    @Prop(Number)
    public maxValue!: number;

    @Prop(Number)
    public step!: number;

    @Prop(Number)
    public value!: number;
}