import { createPinia } from 'pinia';
import { createApp } from 'vue';

import { filters } from './filters';
import { setupErrorHandling } from './error-handler';
import App from './app.vue';
import AppButton from './components/shared/app-button/app-button.vue';
import IconButton from './components/shared/icon-button/icon-button.vue';
import LinkButton from './components/shared/link-button/link-button.vue';
import DropButton from './components/shared/drop-button/drop-button.vue';
import ToggleButton from './components/shared/toggle-button/toggle-button.vue';
import LanguageSelector from './components/shared/language-selector/language-selector.vue';
import AppCheckbox from './components/shared/app-checkbox/app-checkbox.vue';
import AppTypeahead from './components/shared/app-typeahead/app-typeahead.vue';
import AppModal from './components/shared/app-modal/app-modal.vue';
import DropListButton from './components/shared/drop-list-button/drop-list-button.vue';
import PasswordInput from './components/shared/password-input/password-input.vue';
import ValidatedField from './components/shared/validated-field/validated-field.vue';
import PlayIcon from './components/shared/icons/play-icon.vue';
import AppLoader from './components/shared/app-loader/app-loader.vue';
import DataTable from './components/shared/data-table/data-table.vue';
import AppAlert from './components/shared/app-alert/app-alert.vue';
import AppDatepicker from './components/shared/app-datepicker/app-datepicker.vue';
import ConfirmModal from './components/shared/confirm-modal/confirm-modal.vue';
import AppSlider from './components/shared/app-slider/app-slider.vue';
import { tabGuardDirective } from './directives/tab-guard.directive';
import { autoFocusDirective } from './directives/auto-focus.directive';
import { focusLostDirective } from './directives/focus-lost.directive';
import { clickOutsideDirective } from './directives/click-outside.directive';
import { overflowTooltipDirective } from './directives/overflow-tooltip.directive';
import FontAwesomeIcon from './fontawesome-icons';

const app = createApp(App);

setupErrorHandling(app);

app.use(createPinia());

app
  .component('FontAwesomeIcon', FontAwesomeIcon)
  .component('app-button', AppButton)
  .component('icon-button', IconButton)
  .component('link-button', LinkButton)
  .component('app-checkbox', AppCheckbox)
  .component('drop-button', DropButton)
  .component('toggle-button', ToggleButton)
  .component('language-selector', LanguageSelector)
  .component('app-typeahead', AppTypeahead)
  .component('app-modal', AppModal)
  .component('drop-list-button', DropListButton)
  .component('password-input', PasswordInput)
  .component('validated-field', ValidatedField)
  .component('app-loader', AppLoader)
  .component('data-table', DataTable)
  .component('play-icon', PlayIcon)
  .component('app-alert', AppAlert)
  .component('app-datepicker', AppDatepicker)
  .component('confirm-modal', ConfirmModal)
  .component('app-slider', AppSlider);

app
  .directive('auto-focus', autoFocusDirective)
  .directive('focus-lost', focusLostDirective)
  .directive('tab-guard', tabGuardDirective)
  .directive('click-outside', clickOutsideDirective)
  .directive('overflow-tooltip', overflowTooltipDirective);

app.config.globalProperties.$filters = filters;

app.mount('#app');
