import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Main extends Vue {
    public greeting: string = "Greet!";
}