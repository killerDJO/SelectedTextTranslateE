import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faXmark,
  faPlus,
  faCheck,
  faChevronDown,
  faChevronUp,
  faCaretUp,
  faCaretDown,
  faTriangleExclamation,
  faEye,
  faArrowRight,
  faArrowLeft,
  faArrowRightArrowLeft,
  faFilter,
  faStar as faStarSolid,
  faBolt,
  faTrash,
  faBookOpen,
  faAnglesRight,
  faKeyboard
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

library.add(
  faXmark,
  faPlus,
  faCheck,
  faChevronDown,
  faChevronUp,
  faCaretUp,
  faCaretDown,
  faTriangleExclamation,
  faEye,
  faArrowRightArrowLeft,
  faFilter,
  faStarSolid,
  faStarRegular,
  faBolt,
  faTrash,
  faBookOpen,
  faAnglesRight,
  faArrowRight,
  faArrowLeft,
  faKeyboard
);

export default FontAwesomeIcon;
