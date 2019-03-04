import { SortColumn } from "common/dto/history/SortColumn";

export class ColumnNameResolver {
    public columnToNameMap: Map<SortColumn, string> = new Map<SortColumn, string>([
        [SortColumn.Input, "Word"],
        [SortColumn.Translation, "Translation"],
        [SortColumn.Tags, "Tags"],
        [SortColumn.TimesTranslated, "Times"],
        [SortColumn.SourceLanguage, "Source"],
        [SortColumn.TargetLanguage, "Target"],
        [SortColumn.LastTranslatedDate, "Last Translated"],
        [SortColumn.IsArchived, "Status"]
    ]);

    public getColumnName(column: SortColumn): string {
        const columnName = this.columnToNameMap.get(column);
        if (!columnName) {
            throw new Error(`${column} is not available.`);
        }
        return columnName;
    }
}