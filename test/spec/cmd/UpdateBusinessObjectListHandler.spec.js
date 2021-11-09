import TestContainer from 'mocha-test-container-support';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import CmdModule from 'src/cmd';

import diagramXML from './cmd.bpmn';
import customModdleExtensions from './custom-moddle.json';



describe('cmd - UpdateBusinessObjectListHandler', function() {

  const testModules = [
    CoreModule,
    ModelingModule,
    CmdModule
  ];

  let container;


  describe.only('referencePropertyName', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapModeler(diagramXML, {
      container,
      modules: testModules,
      moddleExtensions: {
        i18n: customModdleExtensions
      }
    }));


    it('should NOT remove i18n:translation', inject(function(elementRegistry, commandStack) {

      // given
      const task = elementRegistry.get('Task_1'),
            bo = getBusinessObject(task);
      let extensionElements = bo.get('extensionElements');
      const translations = extensionElements.get('translations');

      // assume
      expect(extensionElements.get('values')).to.have.lengthOf(1);
      expect(extensionElements.get('translations')).to.have.lengthOf(1);

      // when
      commandStack.execute('properties-panel.update-businessobject-list', {
        element: task,
        currentObject: bo.get('extensionElements'),
        referencePropertyName: 'extensionElements',
        propertyName: 'values',
        objectsToRemove: extensionElements.get('values')
      });

      // then
      extensionElements = bo.get('extensionElements');

      expect(extensionElements).to.exist;
      expect(extensionElements.get('translations')).to.eql(translations);
    }));

  });

});
