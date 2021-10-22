import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import InputOutputParameter from './InputOutputParameter';

import {
  areInputParametersSupported,
  createIOMapping,
  getInputParameters,
  getIoMapping
} from '../utils/InputOutputUtil';

import {
  createElement,
  nextId
} from '../../../utils/ElementUtil';


export function InputProps({ element, injector }) {

  if (!areInputParametersSupported(element)) {
    return null;
  }

  const inputParameters = getInputParameters(element) || [];

  const bpmnFactory = injector.get('bpmnFactory'),
        commandStack = injector.get('commandStack');

  const items = inputParameters.map((parameter, index) => {
    const id = element.id + '-input-' + index;

    return {
      id,
      label: parameter.get('target') || '',
      entries: InputOutputParameter({
        idPrefix: id,
        element,
        parameter
      }),
      autoFocusEntry: id + '-target',
      remove: removeFactory({ commandStack, element, parameter })
    };
  });

  return {
    items,
    add: addFactory({ element, bpmnFactory, commandStack })
  };
}

function removeFactory({ commandStack, element, parameter }) {
  return function(event) {
    event.stopPropagation();

    let commands = [];

    const ioMapping = getIoMapping(element);

    if (!ioMapping) {
      return;
    }

    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: ioMapping,
        propertyName: 'inputParameters',
        objectsToRemove: [ parameter ]
      }
    });

    // remove ioMapping if there are no input/output parameters anymore
    if (ioMapping.get('inputParameters').length + ioMapping.get('outputParameters').length === 1) {
      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: getBusinessObject(element).get('extensionElements'),
          propertyName: 'values',
          objectsToRemove: [ ioMapping ]
        }
      });
    }

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}

function addFactory({ element, bpmnFactory, commandStack }) {
  return function(event) {

    event.stopPropagation();

    let commands = [];

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commands.push({
        cmd: 'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: businessObject,
          properties: { extensionElements }
        }
      });
    }

    // (2) ensure IoMapping
    let ioMapping = getIoMapping(element);

    if (!ioMapping) {
      const parent = extensionElements;

      ioMapping = createIOMapping({
        inputParameters: [],
        outputParameters: []
      }, parent, bpmnFactory);

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: extensionElements,
          propertyName: 'values',
          objectsToAdd: [ ioMapping ]
        }
      });
    }

    // (3) create parameter
    const newParameter = createElement('zeebe:Input', {
      source: '= source',
      target: nextId('InputVariable_')
    }, ioMapping, bpmnFactory);

    // (4) add parameter to list
    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: ioMapping,
        propertyName: 'inputParameters',
        objectsToAdd: [ newParameter ]
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };
}
