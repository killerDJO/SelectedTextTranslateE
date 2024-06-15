import type { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import type { filters } from '~/filters';
import type AppButton from '~/components/shared/app-button/app-button.vue';
import type IconButton from '~/components/shared/icon-button/icon-button.vue';
import type LanguageSelector from '~/components/shared/language-selector/language-selector.vue';
import type LinkButton from '~/components/shared/link-button/link-button.vue';
import type AppCheckbox from '~/components/shared/app-checkbox/app-checkbox.vue';
import type DropButton from '~/components/shared/drop-button/drop-button.vue';
import type AppTypeahead from '~/components/shared/app-typeahead/app-typeahead.vue';
import type ToggleButton from '~/components/shared/toggle-button/toggle-button.vue';
import type AppModal from '~/components/shared/app-modal/app-modal.vue';
import type DropListButton from '~/components/shared/drop-list-button/drop-list-button.vue';
import type PasswordInput from '~/components/shared/password-input/password-input.vue';
import type ValidatedField from '~/components/shared/validated-field/validated-field.vue';
import type AppDatepicker from '~/components/shared/app-datepicker/app-datepicker.vue';
import type ConfirmModal from '~/components/shared/confirm-modal/confirm-modal.vue';
import type AppSlider from '~/components/shared/app-slider/app-slider.vue';
import type AppLoader from '~/components/shared/app-loader/app-loader.vue';
import type DataTable from '~/components/shared/data-table/data-table.vue';
import type AppAlert from '~/components/shared/app-alert/app-alert.vue';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    FontAwesomeIcon: typeof FontAwesomeIcon;
    AppButton: typeof AppButton;
    IconButton: typeof IconButton;
    LinkButton: typeof LinkButton;
    AppCheckbox: typeof AppCheckbox;
    DropButton: typeof DropButton;
    LanguageSelector: typeof LanguageSelector;
    ToggleButton: typeof ToggleButton;
    AppTypeahead: typeof AppTypeahead;
    AppModal: typeof AppModal;
    DropListButton: typeof DropListButton;
    PasswordInput: typeof PasswordInput;
    ValidatedField: typeof ValidatedField;
    AppLoader: typeof AppLoader;
    DataTable: typeof DataTable;
    AppAlert: typeof AppAlert;
    AppDatepicker: typeof AppDatepicker;
    ConfirmModal: typeof ConfirmModal;
    AppSlider: typeof AppSlider;
  }

  interface ComponentCustomProperties {
    $filters: typeof filters;
  }
}
