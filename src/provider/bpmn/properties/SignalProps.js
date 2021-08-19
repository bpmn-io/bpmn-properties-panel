import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  sortBy
} from 'min-dash';

import TextField, { isEdited as textFieldIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/TextField';
import ReferenceSelect from '../../../entries/ReferenceSelect';
import { isEdited as selectIsEdited } from '@bpmn-io/properties-panel/lib/components/entries/Select';

import {
  useService
} from '../../../hooks';

import {
  getSignal,
  getSignalEventDefinition,
  isSignalSupported
} from '../utils/EventDefinitionUtil';

import {
  createElement,
  findElementById,
  findRootElementsByType,
  getRoot,
  nextId
} from '../../../utils/ElementUtil';

const CREATE_NEW_OPTION = 'create-new';


/**
 * @typedef { import('@bpmn-io/properties-panel/lib/PropertiesPanel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function SignalProps(props) {
  const {
    element
  } = props;

  if (!isSignalSupported(element)) {
    return [];
  }

  const signal = getSignal(element);

  let entries = [
    {
      id: 'signalRef',
      component: <SignalRef element={ element } />,
      isEdited: selectIsEdited
    }
  ];

  if (signal) {
    entries = [
      ...entries,
      {
        id: 'signalName',
        component: <SignalName element={ element } />,
        isEdited: textFieldIsEdited
      },
    ];
  }

  return entries;
}

function SignalRef(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const signalEventDefinition = getSignalEventDefinition(element);

  const getValue = () => {
    const signal = getSignal(element);

    return signal && signal.get('id');
  };

  const setValue = (value) => {
    const root = getRoot(signalEventDefinition);
    const commands = [];

    let signal;

    // (1) create new signal
    if (value === CREATE_NEW_OPTION) {
      const id = nextId('Signal_');

      signal = createElement(
        'bpmn:Signal',
        { id, name: id },
        root,
        bpmnFactory
      );

      value = signal.get('id');

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element,
          currentObject: root,
          propertyName: 'rootElements',
          objectsToAdd: [ signal ]
        }
      });
    }

    // (2) update (or remove) signalRef
    signal = signal || findElementById(signalEventDefinition, 'bpmn:Signal', value);

    commands.push({
      cmd: 'properties-panel.update-businessobject',
      context: {
        element,
        businessObject: signalEventDefinition,
        properties: {
          signalRef: signal
        }
      }
    });

    // (3) commit all updates
    return commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  const getOptions = () => {

    let options = [
      { value: '', label: translate('<none>') },
      { value: CREATE_NEW_OPTION, label: translate('Create new ...') }
    ];

    const signals = findRootElementsByType(getBusinessObject(element), 'bpmn:Signal');

    sortByName(signals).forEach(signal => {
      options.push({
        value: signal.get('id'),
        label: signal.get('name')
      });
    });

    return options;
  };

  return ReferenceSelect({
    element,
    id: 'signalRef',
    label: translate('Global Signal reference'),
    autoFocusEntry: 'signalName',
    getValue,
    setValue,
    getOptions
  });
}

function SignalName(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const signal = getSignal(element);

  const getValue = () => {
    return signal.get('name');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'properties-panel.update-businessobject',
      {
        element,
        businessObject: signal,
        properties: {
          name: value
        }
      }
    );
  };

  return TextField({
    element,
    id: 'signalName',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}


// helper /////////////////////////

function sortByName(elements) {
  return sortBy(elements, e => (e.name || '').toLowerCase());
}