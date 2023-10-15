import { HistoryColumn, Settings } from '@selected-text-translate/common';

export const defaultSettings: Omit<Settings, 'supportedLanguages'> = {
  engine: {
    copyDelayMilliseconds: 100,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    requestTimeout: 10000,
    playVolume: 100,
    enableRequestsLogging: false,
    proxy: {
      isEnabled: false,
      url: 'http://localhost:8888'
    }
  },
  logging: {
    maxLogSize: 1048576,
    logFileName: 'log.txt'
  },
  search: {
    searchPattern: 'https://www.google.com.ua/search?safe=off&source=hp&q={{query}}'
  },
  scaling: {
    scaleFactor: 1,
    scaleTranslationViewOnly: true,
    scalingStep: 0.05,
    minScaling: 0.7,
    maxScaling: 2,
    verticalResolutionBaseline: 860
  },
  renderer: {
    hotkeys: {
      zoomIn: [
        {
          keys: ['Control', '+']
        },
        {
          keys: ['Control', '=']
        }
      ],
      zoomOut: [
        {
          keys: ['Control', '-']
        }
      ],
      resetZoom: [
        {
          keys: ['Control', '0']
        }
      ]
    }
  },
  views: {
    translation: {
      width: 300,
      height: 400,
      margin: 5,
      x: null,
      y: null,
      renderer: {
        visibility: {
          visibleByDefaultNumber: 7
        },
        toggleDefinitionHotkey: [
          {
            keys: ['Control', 'Shift', 'D']
          }
        ],
        archiveResultHotkey: [
          {
            keys: ['Delete']
          }
        ],
        addTagHotkey: [
          {
            keys: ['Shift', 'T']
          }
        ],
        toggleTagsHotkey: [
          {
            keys: ['Alt', 'T']
          }
        ]
      }
    },
    history: {
      width: 70,
      height: 55,
      renderer: {
        pageSize: 20,
        lastRecordsToScanForMerge: 10000,
        columns: {
          [HistoryColumn.Translation]: {
            isVisible: true,
            weight: 1
          },
          [HistoryColumn.Input]: {
            isVisible: true,
            weight: 1
          },
          [HistoryColumn.Tags]: {
            isVisible: true,
            weight: 0.65
          },
          [HistoryColumn.TimesTranslated]: {
            isVisible: true,
            weight: 0.25
          },
          [HistoryColumn.LastTranslatedDate]: {
            isVisible: true,
            weight: 0.45
          },
          [HistoryColumn.SourceLanguage]: {
            isVisible: false,
            weight: 0.4
          },
          [HistoryColumn.TargetLanguage]: {
            isVisible: false,
            weight: 0.4
          },
          [HistoryColumn.IsArchived]: {
            isVisible: true,
            weight: 0.2
          }
        }
      }
    },
    settings: {
      width: 35,
      height: 45
    },
    about: {
      width: 500,
      height: 150
    }
  },
  hotkeys: {
    playText: [
      {
        keys: ['Control', 'R']
      }
    ],
    translate: [
      {
        keys: ['Control', 'T']
      }
    ],
    showDefinition: [
      {
        keys: ['Control', 'D']
      }
    ],
    inputText: [
      {
        keys: ['Control', 'Shift', 'T']
      }
    ],
    toggleSuspend: [
      {
        keys: ['Shift', 'Control', 'Alt', 'S']
      }
    ]
  },
  update: {
    feedUrl: 'https://update.electronjs.org/killerDJO/SelectedTextTranslateReleases',
    releasesUrl: 'https://github.com/killerDJO/SelectedTextTranslateReleases/releases'
  },
  firebase: {
    apiKey: 'AIzaSyAuHtBBH6VTFdX12AAOFiIa9xWl7AC2m0A',
    authDomain: 'stte-cad70.firebaseapp.com',
    projectId: 'stte-cad70'
  },
  tags: {
    currentTags: []
  },
  language: {
    sourceLanguage: 'en',
    targetLanguage: 'ru'
  }
};
