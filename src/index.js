export { default as BpmnPropertiesPanelModule } from './render';
export { default as BpmnPropertiesProviderModule } from './provider/bpmn';
export { default as CamundaPlatformPropertiesProviderModule } from './provider/camunda-platform';
export { default as ZeebePropertiesProviderModule } from './provider/zeebe';
export { default as DesignPropertiesProviderModule } from './provider/design';

// hooks
export { useService } from './hooks';