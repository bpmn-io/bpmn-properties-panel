export default class DesignPropertiesProvider {

  constructor(propertiesPanel, editorActions, config) {
    propertiesPanel.registerProvider('design', this);

    this._editorActions = editorActions;
    this._config = config;
  }

  getGroups(element) {

    // const editorActions = this._editorActions;

    // const { openEngineProfile } = this._config;

    // const enableExecutionProperties = () => openEngineProfile();

    return (groups) => {

      // groups.push({
      //   id: 'executionProperties',
      //   label: 'Execution Properties',
      //   entries: [
      //     {
      //       id: 'executionProperties',
      //       component: <EnableExecutionEntry onEnable={ enableExecutionProperties } />
      //     }
      //   ]
      // });

      groups = groups.filter(g => g.id === 'documentation');

      return groups;
    };
  }

}

DesignPropertiesProvider.$inject = [ 'propertiesPanel', 'editorActions', 'config.designPropertiesProvider' ];

function EnableExecutionEntry(props) {

  const {
    onEnable
  } = props;

  return (
    <div class="bio-properties-panel-entry" data-entry-id="executionProperties">
      <div class="bio-properties-panel-description">To edit execution properties, their visibility can be switched on the engine profile dialog in the status bar.</div>
      <a href="#" onClick={ onEnable }>Open the engine profile dialog</a>
    </div>
  );
}