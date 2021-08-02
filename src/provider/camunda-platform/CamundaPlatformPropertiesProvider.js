import Group from '@bpmn-io/properties-panel/lib/components/Group';
import ListGroup from '@bpmn-io/properties-panel/lib/components/ListGroup';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import { findIndex } from 'min-dash';

import {
  AsynchronousContinuationsProps,
  CandidateStarterProps,
  ExtensionPropertiesProps,
  ExternalTaskPriorityProps,
  FieldInjectionProps,
  HistoryCleanupProps,
  JobExecutionProps,
  InitiatorProps,
  ProcessVariablesProps,
  ScriptTaskProps,
  TasklistProps,
  UserAssignmentProps,
  VersionTagProps
} from './properties';


const LOW_PRIORITY = 500;

/**
 * Provides `camunda` namespace properties.
 *
 * @example
 * ```javascript
 * import BpmnModeler from 'bpmn-js/lib/Modeler';
 * import {
 *   BpmnPropertiesPanelModule,
 *   BpmnPropertiesProviderModule,
 *   CamundaPlatformPropertiesProviderModule
 * } from '@bpmn-io/bpmn-properties-panel';
 *
 * const modeler = new BpmnModeler({
 *   container: '#canvas',
 *   propertiesPanel: {
 *     parent: '#properties'
 *   },
 *   additionalModules: [
 *     BpmnPropertiesPanelModule,
 *     BpmnPropertiesProviderModule,
 *     CamundaPlatformPropertiesProviderModule
 *   ]
 * });
 * ```
 */
export default class CamundaPlatformPropertiesProvider {

  constructor(propertiesPanel) {
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
  }

  getGroups(element) {
    return (groups) => {

      // (1) add Camunda Platform specific groups
      groups = groups.concat(this._getGroups(element));

      // (2) update existing groups with Camunda Platform specific properties
      updateGeneralGroup(groups, element);

      return groups;
    };
  }

  _getGroups(element) {
    const groups = [
      ProcessVariablesGroup(element),
      UserAssignmentGroup(element),
      StartInitiatorGroup(element),
      ScriptGroup(element),
      AsynchronousContinuationsGroup(element),
      CallActivityGroup(element),
      CandidateStarterGroup(element),
      ConditionalGroup(element),
      ConnectorGroup(element),
      DelegatePropsGroup(element),
      ErrorGroup(element),
      EventGroup(element),
      ExtensionPropertiesGroup(element),
      ExternalTaskGroup(element),
      FieldInjectionGroup(element),
      FormGroup(element),
      HistoryCleanupGroup(element),
      InputOutputGroup(element),
      JobExecutionGroup(element),
      LinkGroup(element),
      ListenerGroup(element),
      MultiInstanceGroup(element),
      TasklistGroup(element),
      VariablesMappingGroup(element)
    ];

    // contract: if a group returns null, it should not be displayed at all
    return groups.filter(group => group !== null);
  }
}

CamundaPlatformPropertiesProvider.$inject = [ 'propertiesPanel' ];

function updateGeneralGroup(groups, element) {

  const generalGroup = findGroup(groups, 'general');

  if (!generalGroup) {
    return;
  }

  const { entries } = generalGroup;

  // (1) add version tag before executable (if existing)
  const executableEntry = findIndex(entries, (entry) => entry.id === 'isExecutable');
  const insertIndex = executableEntry >= 0 ? executableEntry : entries.length;

  entries.splice(insertIndex, 0, ...VersionTagProps({ element }));
}

// @TODO: implement, hide with no entries in the meantime
function DelegatePropsGroup(element) {

  if (!is(element, 'camunda:ServiceTaskLike')) {
    return null;
  }

  const group = {
    label: 'Delegate Props',
    id: 'CamundaPlatform__DelegateProps',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function UserAssignmentGroup(element) {

  const group = {
    label: 'User Assignment',
    id: 'CamundaPlatform__UserAssignment',
    component: Group,
    entries: [
      ...UserAssignmentProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function ScriptGroup(element) {

  const group = {
    label: 'Script',
    id: 'CamundaPlatform__Script',
    component: Group,
    entries: [
      ...ScriptTaskProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function LinkGroup(element) {
  const group = {
    label: 'Link',
    id: 'CamundaPlatform__Link',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function CallActivityGroup(element) {

  if (!is(element, 'bpmn:CallActivity')) {
    return null;
  }

  const group = {
    label: 'Call Activity',
    id: 'CamundaPlatform__CallActivity',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function EventGroup(element) {

  if (!is(element, 'bpmn:Event')) {
    return null;
  }

  const group = {
    label: 'Event',
    id: 'CamundaPlatform__Event',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function ErrorGroup(element) {
  const group = {
    label: 'Error',
    id: 'CamundaPlatform__Error',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function ConditionalGroup(element) {
  const group = {
    label: 'Conditional',
    id: 'CamundaPlatform__Conditional',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function StartInitiatorGroup(element) {
  const group = {
    label: 'Start Initiator',
    id: 'CamundaPlatform__StartInitiator',
    component: Group,
    entries: [
      ...InitiatorProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function ExternalTaskGroup(element) {
  const group = {
    label: 'External Task',
    id: 'CamundaPlatform__ExternalTask',
    component: Group,
    entries: [
      ...ExternalTaskPriorityProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function MultiInstanceGroup(element) {
  const group = {
    label: 'Multi Instance',
    id: 'CamundaPlatform__MultiInstance',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function AsynchronousContinuationsGroup(element) {
  const group = {
    label: 'Asynchronous Continuations',
    id: 'CamundaPlatform__AsynchronousContinuations',
    component: Group,
    entries: [
      ...AsynchronousContinuationsProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function JobExecutionGroup(element) {
  const group = {
    label: 'Job Execution',
    id: 'CamundaPlatform__JobExecution',
    component: Group,
    entries: [
      ...JobExecutionProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function CandidateStarterGroup(element) {
  const group = {
    label: 'Candidate Starter',
    id: 'CamundaPlatform__CandidateStarter',
    component: Group,
    entries: [
      ...CandidateStarterProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function FieldInjectionGroup(element) {
  const group = {
    label: 'Field Injection',
    id: 'CamundaPlatform__FieldInjection',
    component: ListGroup,
    ...FieldInjectionProps({ element })
  };

  if (group.items) {
    return group;
  }

  return null;
}

function HistoryCleanupGroup(element) {
  const group = {
    label: 'History Cleanup',
    id: 'CamundaPlatform__HistoryCleanup',
    component: Group,
    entries: [
      ...HistoryCleanupProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function TasklistGroup(element) {
  const group = {
    label: 'Tasklist',
    id: 'CamundaPlatform__Tasklist',
    component: Group,
    entries: [
      ...TasklistProps({ element })
    ]
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function VariablesMappingGroup(element) {
  const group = {
    label: 'Variables Mapping',
    id: 'CamundaPlatform__VariablesMapping',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function ProcessVariablesGroup(element) {
  const group = {
    label: 'Process Variables',
    id: 'CamundaPlatform__ProcessVariables',
    component: ListGroup,
    ...ProcessVariablesProps({ element })
  };

  if (group.items) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function FormGroup(element) {
  const group = {
    label: 'Form',
    id: 'CamundaPlatform__Form',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function ListenerGroup(element) {
  const group = {
    label: 'Listener',
    id: 'CamundaPlatform__Listener',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function InputOutputGroup(element) {
  const group = {
    label: 'Input Output',
    id: 'CamundaPlatform__InputOutput',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

// @TODO: implement, hide with no entries in the meantime
function ConnectorGroup(element) {
  const group = {
    label: 'Connector',
    id: 'CamundaPlatform__Connector',
    component: Group,
    entries: []
  };

  if (group.entries.length) {
    return group;
  }

  return null;
}

function ExtensionPropertiesGroup(element) {
  const group = {
    label: 'Extension Properties',
    id: 'CamundaPlatform__ExtensionProperties',
    component: ListGroup,
    ...ExtensionPropertiesProps({ element })
  };

  if (group.items) {
    return group;
  }

  return null;
}


// helper /////////////////////

function findGroup(groups, id) {
  return groups.find(g => g.id === id);
}
