import * as moment from "moment";

import { FilterOptions } from "decorators/FilterOptions";
import Filter from "decorators/VueFilter";

@Filter("date-time")
export class DateTime implements FilterOptions<Date | number, string> {
    public execute(input: number | Date): string {
        return moment(input).format("D/MM/YYYY, H:mm");
    }
}