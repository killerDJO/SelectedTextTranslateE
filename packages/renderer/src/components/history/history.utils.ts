import { HistoryColumn } from '@selected-text-translate/common';

export function getColumnName(column: HistoryColumn): string {
  const columnToNameMap: Map<HistoryColumn, string> = new Map<HistoryColumn, string>([
    [HistoryColumn.Input, 'Word'],
    [HistoryColumn.Translation, 'Translation'],
    [HistoryColumn.Tags, 'Tags'],
    [HistoryColumn.TimesTranslated, 'Times'],
    [HistoryColumn.SourceLanguage, 'Source'],
    [HistoryColumn.TargetLanguage, 'Target'],
    [HistoryColumn.LastTranslatedDate, 'Last Translated'],
    [HistoryColumn.IsArchived, 'Status']
  ]);

  const columnName = columnToNameMap.get(column);
  if (!columnName) {
    throw new Error(`${column} is not available.`);
  }
  return columnName;
}
