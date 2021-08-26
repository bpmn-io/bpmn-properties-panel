import {
  find,
  sortBy
} from 'min-dash';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isEdited as selectIsEdited
} from '@bpmn-io/properties-panel/lib/components/entries/Select';

import Checkbox from '@bpmn-io/properties-panel/lib/components/entries/Checkbox';

import {
  useService
} from '../../../hooks';

import ReferenceSelect from '../../../entries/ReferenceSelect';

import {
  getCompensateActivity,
  getCompensateEventDefinition,
  isCompensationSupported
} from '../utils/EventDefinitionUtil';

/**
 * @typedef { import('@bpmn-io/properties-panel/lib/PropertiesPanel').EntryDefinition } Entry
 */

/**
 * @returns {Array<Entry>} entries
 */
export function CompensationProps(props) {
  const {
    element
  } = props;

  if (!isCompensationSupported(element)) {
    return [];
  }

  const isCheckboxEdited = (node) => {
    return node && !node.checked;
  };

  return [
    {
      id: 'waitForCompletion',
      component: <WaitForCompletion element={ element } />,
      isEdited: isCheckboxEdited
    },
    {
      id: 'activityRef',
      component: <ActivityRef element={ element } />,
      isEdited: selectIsEdited
    }
  ];
}

function WaitForCompletion(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const compensateEventDefinition = getCompensateEventDefinition(element);

  const getValue = () => {
    return compensateEventDefinition.get('waitForCompletion');
  };

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element: element,
      businessObject: compensateEventDefinition,
      properties: {
        'waitForCompletion': value
      }
    });
  };

  return Checkbox({
    element,
    id: 'waitForCompletion',
    label: translate('Wait for completion'),
    getValue,
    setValue
  });
}

function ActivityRef(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const elementRegistry = useService('elementRegistry');
  const translate = useService('translate');

  const compensateEventDefinition = getCompensateEventDefinition(element);

  const getValue = () => {
    const activityRef = getCompensateActivity(element);

    return activityRef && activityRef.get('id');
  };

  const setValue = (value) => {

    // update (or remove) activityRef
    const activityRef = value ? getBusinessObject(elementRegistry.get(value)) : undefined;

    commandStack.execute('properties-panel.update-businessobject', {
      element,
      businessObject: compensateEventDefinition,
      properties: {
        activityRef
      }
    });
  };

  const getOptions = () => {

    let options = [
      { value: '', label: translate('<none>') },
    ];

    const activities = findActivityRefs(element);

    sortByName(activities).forEach(function(activity) {
      options.push({
        value: activity.id,
        label: createOptionLabel(activity)
      });
    });

    return options;
  };

  return ReferenceSelect({
    element,
    id: 'activityRef',
    label: translate('Activity reference'),
    getValue,
    setValue,
    getOptions
  });
}


// helper /////////////////////////

function getFlowElements(element, type) {
  const { flowElements } = element;
  return flowElements.filter(function(flowElement) {
    return is(flowElement, type);
  });
}

function getContainedActivities(element) {
  return getFlowElements(element, 'bpmn:Activity');
}

function getContainedBoundaryEvents(element) {
  return getFlowElements(element, 'bpmn:BoundaryEvent');
}

/**
 * Checks whether an Activity is attaching a CompensateEvent of the parent container.
 *
 * @param {ModdleElement} activity
 * @param {Array<ModdleElement>} boundaryEvents
 * @returns {Boolean}
 */
function hasCompensationEventAttached(activity, boundaryEvents) {
  const { id: activityId } = activity;

  return !!find(boundaryEvents, function(boundaryEvent) {
    const { attachedToRef } = boundaryEvent;
    const compensateEventDefinition = getCompensateEventDefinition(boundaryEvent);

    return attachedToRef && compensateEventDefinition && attachedToRef.id === activityId;
  });
}

/**
 * Checks whether an Activity can be compensated. That's the case when it is
 * a) a CallActivity
 * b) a SubProcess, when it is not event based
 * c) any other Activity, when it is attaching a CompensateEvent of the parent container
 *
 * @param {ModdleElement} activity
 * @param {Array<ModdleElement>} boundaryEvents
 * @returns {Boolean}
 */
function canBeCompensated(activity, boundaryEvents) {
  return is(activity, 'bpmn:CallActivity') ||
    (is(activity, 'bpmn:SubProcess') && !activity.triggeredByEvent) ||
    hasCompensationEventAttached(activity, boundaryEvents);
}

function getActivitiesForCompensation(element) {
  const activities = getContainedActivities(element);
  const boundaryEvents = getContainedBoundaryEvents(element);

  return activities.filter(function(activity) {
    return canBeCompensated(activity, boundaryEvents);
  });
}

/**
 * Retrieves all possible activities to reference for a Compensation.
 *
 * @param {djs.model.Base} element
 * @returns {Array<ModdleElement>}
 */
function findActivityRefs(element) {
  const businessObject = getBusinessObject(element);

  let parent = businessObject.$parent;

  // (1) get all activities in parent container
  let activities = getActivitiesForCompensation(parent);

  // (2) if throwing compensation event is inside an EventSubProcess,
  // also get all activities outside of the event sub process
  if (is(parent, 'bpmn:SubProcess') && parent.triggeredByEvent) {
    parent = parent.$parent;
    if (parent) {
      activities = [
        ...activities,
        ...getActivitiesForCompensation(parent)
      ];
    }

  }

  return activities;
}

/**
 * Retrieves an option label in the form
 * a) with name: "my Task (id=Task_1)"
 * b) without name: "(id=Task_1)"
 *
 * @param {ModdleElement} activity
 * @returns {String}
 */
function createOptionLabel(activity) {
  const { id, name } = activity;

  return `${name ? name + ' ' : ''}(id=${id})`;
}

function sortByName(elements) {
  return sortBy(elements, e => (e.name || '').toLowerCase());
}