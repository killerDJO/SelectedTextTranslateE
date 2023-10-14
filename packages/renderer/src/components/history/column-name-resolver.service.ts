import { HistorySortColumn } from '@selected-text-translate/common';

export class ColumnNameResolver {
  public columnToNameMap: Map<HistorySortColumn, string> = new Map<HistorySortColumn, string>([
    [HistorySortColumn.Input, 'Word'],
    [HistorySortColumn.Translation, 'Translation'],
    [HistorySortColumn.Tags, 'Tags'],
    [HistorySortColumn.TimesTranslated, 'Times'],
    [HistorySortColumn.SourceLanguage, 'Source'],
    [HistorySortColumn.TargetLanguage, 'Target'],
    [HistorySortColumn.LastTranslatedDate, 'Last Translated'],
    [HistorySortColumn.IsArchived, 'Status']
  ]);

  public getColumnName(column: HistorySortColumn): string {
    const columnName = this.columnToNameMap.get(column);
    if (!columnName) {
      throw new Error(`${column} is not available.`);
    }
    return columnName;
  }
}
