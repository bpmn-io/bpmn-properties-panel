import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  ElementTemplatesGroup,
  TemplateProps
} from './components';

import {
  CustomProperties,
  ErrorProperties,
  InputProperties,
  OutputProperties
} from './properties';

import { getTemplateId } from './Helper';

const CAMUNDA_ERROR_EVENT_DEFINITION_TYPE = 'camunda:errorEventDefinition',
      CAMUNDA_INPUT_PARAMETER_TYPE = 'camunda:inputParameter',
      CAMUNDA_OUTPUT_PARAMETER_TYPE = 'camunda:outputParameter';

const LOWER_PRIORITY = 300;

const PLATFORM_UPDATED_GROUPS = [
  'CamundaPlatform__Input',
  'CamundaPlatform__Output',
  'CamundaPlatform__Errors'
];


export default class ElementTemplatesPropertiesProvider {

  constructor(elementTemplates, propertiesPanel, injector) {
    propertiesPanel.registerProvider(LOWER_PRIORITY, this);

    this._elementTemplates = elementTemplates;
    this._injector = injector;
  }

  getGroups(element) {
    return (groups) => {

      if (!this._shouldShowTemplateProperties(element)) {
        return groups;
      }

      // (0) Copy provided groups
      groups = groups.slice();

      const templatesGroup = {
        element,
        id: 'ElementTemplates__Template',
        label: 'Template',
        component: ElementTemplatesGroup,
        entries: TemplateProps({ element, elementTemplates: this._elementTemplates })
      };

      // (1) Add templates group
      addGroupsAfter('documentation', groups, [ templatesGroup ]);

      const elementTemplate = this._elementTemplates.get(element);

      if (elementTemplate) {
        const customPropertiesGroups = CustomProperties({ element, elementTemplate });

        // (2) add custom properties groups
        addGroupsAfter('ElementTemplates__Template', groups, [ ...customPropertiesGroups ]);

        // (3) update existing groups with element template specific properties
        updateInputGroup(groups, element, elementTemplate);
        updateOutputGroup(groups, element, elementTemplate, this._injector);
        updateErrorsGroup(groups, element, elementTemplate);
      }

      // (4) apply entries visible
      if (getTemplateId(element)) {
        const visibleGroups = elementTemplate ? PLATFORM_UPDATED_GROUPS : [];

        groups = filterWithEntriesVisible(elementTemplate || {}, groups, visibleGroups);
      }

      return groups;
    };
  }

  _shouldShowTemplateProperties(element) {
    return getTemplateId(element) || this._elementTemplates.getAll().some(template => {
      return isAny(element, template.appliesTo);
    });
  }
}

ElementTemplatesPropertiesProvider.$inject = [
  'elementTemplates',
  'propertiesPanel',
  'injector'
];


// helper /////////////////////

function updateInputGroup(groups, element, elementTemplate) {
  const inputGroup = findGroup(groups, 'CamundaPlatform__Input');

  if (!inputGroup) {
    return;
  }

  delete inputGroup.add;

  inputGroup.items = [];

  const properties = elementTemplate.properties.filter(({ binding, type }) => {
    return !type && binding.type === CAMUNDA_INPUT_PARAMETER_TYPE;
  });

  properties.forEach((property, index) => {
    const item = InputProperties({ element, index, property });

    if (item) {
      inputGroup.items.push(item);
    }
  });

  // remove if empty
  if (!inputGroup.items.length) {
    groups.splice(groups.indexOf(inputGroup), 1);
  }
}

function updateOutputGroup(groups, element, elementTemplate, injector) {
  const outputGroup = findGroup(groups, 'CamundaPlatform__Output');

  if (!outputGroup) {
    return;
  }

  delete outputGroup.add;

  outputGroup.items = [];

  const properties = elementTemplate.properties.filter(({ binding, type }) => {
    return !type && binding.type === CAMUNDA_OUTPUT_PARAMETER_TYPE;
  });

  properties.forEach((property, index) => {
    const item = OutputProperties({ element, index, property, injector });

    if (item) {
      outputGroup.items.push(item);
    }
  });

  // remove if empty
  if (!outputGroup.items.length) {
    groups.splice(groups.indexOf(outputGroup), 1);
  }
}

function updateErrorsGroup(groups, element, elementTemplate) {
  const errorsGroup = findGroup(groups, 'CamundaPlatform__Errors');

  if (!errorsGroup) {
    return;
  }

  delete errorsGroup.add;

  errorsGroup.items = [];

  const properties = elementTemplate.properties.filter(({ binding, type }) => {
    return !type && binding.type === CAMUNDA_ERROR_EVENT_DEFINITION_TYPE;
  });

  properties.forEach((property, index) => {
    const item = ErrorProperties({ element, index, property });

    if (item) {
      errorsGroup.items.push(item);
    }
  });

  // remove if empty
  if (!errorsGroup.items.length) {
    groups.splice(groups.indexOf(errorsGroup), 1);
  }
}

/**
 *
 * @param {string} id
 * @param {Array<{ id: string }} groups
 * @param {Array<{ id: string }>} groupsToAdd
 */
function addGroupsAfter(id, groups, groupsToAdd) {
  const index = groups.findIndex(group => group.id === id);

  if (index !== -1) {
    groups.splice(index + 1, 0, ...groupsToAdd);
  } else {

    // add in the beginning if group with provided id is missing
    groups.unshift(...groupsToAdd);
  }
}

function findGroup(groups, id) {
  return groups.find((group) => group.id === id);
}

function filterWithEntriesVisible(template, groups, visibleGroups = []) {
  if (!template.entriesVisible) {
    return groups.filter(group => {
      return (
        group.id === 'general' ||
        group.id.startsWith('ElementTemplates__') ||
        visibleGroups.includes(group.id)
      );
    });
  }

  return groups;
}
