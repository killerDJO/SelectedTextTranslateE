import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Main extends Vue {
    public greeting: string = "Greet1!";

    public processClick(): void {
        this.greeting = Date().toString();
    }
}