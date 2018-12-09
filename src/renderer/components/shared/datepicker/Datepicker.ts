import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import * as moment from "moment";
import { default as VuejsDatepicker } from "vuejs-datepicker";
import { DropBase } from "components/shared/DropBase";

@Component({
    components: {
        VuejsDatepicker
    }
})
export default class Datepicker extends DropBase {

    @Prop(Date)
    public value!: Date;

    @Prop({
        type: Boolean,
        default: false
    })
    public disableFutureDates!: boolean;

    public isPickerVisible: boolean = false;
    public calendarClass: string = "calendar";

    public highlightedDates: any = {
        customPredictor: this.isDateHighlighted.bind(this)
    };

    public disabledDates: any = {
        customPredictor: this.isDateDisabled.bind(this)
    };

    public get datepicker(): Vue {
        return this.$refs.datepicker as Vue;
    }

    public mounted() {
        const datepickerElement = (this.datepicker as any).$el as HTMLElement;
        const calendars = datepickerElement.querySelectorAll(`.${this.calendarClass}`);
        const dropContent = this.$refs.dropContent as HTMLElement;
        calendars.forEach(calendar => dropContent.appendChild(calendar));

        this.patchMethod(this.datepicker, "setInitialView", originalMethod => {
            originalMethod();
            this.isPickerVisible = true;
            this.$nextTick(() => this.onCalendarOpened());
        });

        this.patchMethod(this.datepicker, "close", originalMethod => {
            this.isPickerVisible = false;
            dropContent.style.display = "none";
            this.closeDrop();
            originalMethod();
        });
    }

    public patchMethod(instance: any, name: string, patch: (originalMethod: () => void) => void): void {
        const originalMethod = instance[name];
        instance[name] = (...args: any[]) => {
            patch(() => originalMethod(...args));
        };
    }

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

    public onCalendarOpened(): void {
        this.openDropInternal(this.datepicker.$el, this.$refs.dropContent as Element, "bottom-start", {});
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