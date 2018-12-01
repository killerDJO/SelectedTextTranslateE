import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import * as moment from "moment";
import { default as VuejsDatepicker } from "vuejs-datepicker";

@Component({
    components: {
        VuejsDatepicker
    }
})
export default class Datepicker extends Vue {

    @Prop(Date)
    public value!: Date;

    @Prop({
        type: Boolean,
        default: false
    })
    public disableFutureDates!: boolean;

    public highlightedDates: any = {
        customPredictor: this.isDateHighlighted.bind(this)
    };

    public disabledDates: any = {
        customPredictor: this.isDateDisabled.bind(this)
    };

    public get value$(): Date | null {
        return this.value;
    }

    public set value$(value: Date | null) {
        this.$emit("update:value", value);
    }

    public toggleCalendar(): void {
        const datepicker: any = this.$refs.datepicker;
        if (datepicker.isOpen) {
            datepicker.close();
        } else {
            datepicker.showCalendar();
        }
    }

    public clear(): void {
        this.value$ = null;
    }

    public dateFormatter(date: Date) {
        return moment(date).format("D/MM/YYYY");
    }

    public isDateHighlighted(date: Date) {
        return this.dateFormatter(date) === this.dateFormatter(new Date());
    }

    public isDateDisabled(date: Date) {
        if (!this.disableFutureDates) {
            return false;
        }

        return date > new Date();
    }
}