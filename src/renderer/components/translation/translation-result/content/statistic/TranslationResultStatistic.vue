<template>
    <div class="statistic">
        <table class="table-striped non-clickable statistics-table headless">
            <tbody>
              <tr>
                <td>Times translated</td>
                <td>{{historyRecord.translationsNumber}}</td>
              </tr>
              <tr>
                <td>First translated</td>
                <td>{{historyRecord.createdDate | date-time}}</td>
              </tr>
              <tr>
                <td>Last translated</td>
                <td>{{historyRecord.lastTranslatedDate | date-time}}</td>
              </tr>
              <tr>
                <td>Last updated</td>
                <td>{{historyRecord.updatedDate | date-time}}</td>
              </tr>
              <tr>
                <td>Source Language</td>
                <td>{{languages.get(historyRecord.sourceLanguage)}}</td>
              </tr>
              <tr>
                <td>Target Language</td>
                <td>{{languages.get(historyRecord.targetLanguage)}}</td>
              </tr>
              <tr>
                <td>Archived</td>
                <td>{{historyRecord.isArchived ? "Yes" : "No"}}</td>
              </tr>
            </tbody>
          </table>
        <link-button @click="refreshTranslation" :text="'Refresh Record'" class="refresh-button"/>
    </div>
</template>

<script src="./TranslationResultStatistic.ts" lang="ts"></script>
<style src="./TranslationResultStatistic.scss" lang="scss" scoped></style>