/* eslint-disable react-hooks/rules-of-hooks */

import {
  useService
} from '../../hooks';

const DescriptionProvider = [
  {
    idRegex: /^id$/,
    description: (element, match) => {
      const translate = useService('translate');

      return translate('some descriptions able to access the element data of currently selected element: ' + element.type);
    }
  },
  {
    idRegex: /^\w+_\d+-output-\d+-target$/,
    description: (element, match) => {
      const translate = useService('translate');

      return translate('Matched output input');
    }
  }
];

export default DescriptionProvider;
