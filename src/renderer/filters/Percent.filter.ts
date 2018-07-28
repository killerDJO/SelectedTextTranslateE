import * as moment from "moment";

import { FilterOptions } from "decorators/FilterOptions";
import Filter from "decorators/VueFilter";

@Filter()
class Percent implements FilterOptions<number, string> {
    public execute(input: number): string {
        return `${Math.round(input)}%`;
    }
}