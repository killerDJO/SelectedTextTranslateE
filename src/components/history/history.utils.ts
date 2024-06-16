import { HistoryColumnName } from '~/host/models/settings.model';

export function getColumnDisplayName(column: HistoryColumnName): string {
  const columnToNameMap: { [key in HistoryColumnName]: string } = {
    input: 'Word',
    translation: 'Translation',
    tags: 'Tags',
    timesTranslated: 'Times',
    sourceLanguage: 'Source',
    targetLanguage: 'Target',
    lastTranslatedDate: 'Last Translated',
    archived: 'Status'
  };

  const columnName = columnToNameMap[column];
  return columnName;
}
