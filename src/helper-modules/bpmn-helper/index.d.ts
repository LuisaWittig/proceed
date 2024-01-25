declare const _exports: {
  ensureExtensionElements: typeof proceedExtensions.ensureExtensionElements;
  removeEmptyExtensionElements: typeof proceedExtensions.removeEmptyExtensionElements;
  ensureContainerElement: typeof proceedExtensions.ensureContainerElement;
  removeEmptyContainerElement: typeof proceedExtensions.removeEmptyContainerElement;
  setMetaData: typeof proceedExtensions.setMetaData;
  setProceedElement: typeof proceedExtensions.setProceedElement;
  getExporterName: typeof proceedConstants.getExporterName;
  getExporterVersion: typeof proceedConstants.getExporterVersion;
  generateBpmnId: typeof proceedConstants.generateBpmnId;
  generateDefinitionsId: typeof proceedConstants.generateDefinitionsId;
  generateProcessId: typeof proceedConstants.generateProcessId;
  generateUserTaskFileName: typeof proceedConstants.generateUserTaskFileName;
  getUserTaskImplementationString: typeof proceedConstants.getUserTaskImplementationString;
  generateTargetNamespace: typeof proceedConstants.generateTargetNamespace;
  initXml: typeof proceedConstants.initXml;
  validateCalledProcess: typeof validators.validateCalledProcess;
  setDefinitionsId: typeof setters.setDefinitionsId;
  setDefinitionsName: typeof setters.setDefinitionsName;
  setDefinitionsVersionInformation: typeof setters.setDefinitionsVersionInformation;
  setProcessId: typeof setters.setProcessId;
  setTemplateId: typeof setters.setTemplateId;
  setTargetNamespace: typeof setters.setTargetNamespace;
  setStandardDefinitions: typeof setters.setStandardDefinitions;
  setDeploymentMethod: typeof setters.setDeploymentMethod;
  setMachineInfo: typeof setters.setMachineInfo;
  setUserTaskData: typeof setters.setUserTaskData;
  addConstraintsToElementById: typeof setters.addConstraintsToElementById;
  addCallActivityReference: typeof setters.addCallActivityReference;
  removeCallActivityReference: typeof setters.removeCallActivityReference;
  removeUnusedCallActivityReferences: typeof setters.removeUnusedCallActivityReferences;
  removeColorFromAllElements: typeof setters.removeColorFromAllElements;
  addDocumentation: typeof setters.addDocumentation;
  addDocumentationToProcessObject: typeof setters.addDocumentationToProcessObject;
  updatePerformersOnElement: typeof setters.updatePerformersOnElement;
  updatePerformersOnElementById: typeof setters.updatePerformersOnElementById;
  getDefinitionsId: typeof getters.getDefinitionsId;
  getOriginalDefinitionsId: typeof getters.getOriginalDefinitionsId;
  getDefinitionsName: typeof getters.getDefinitionsName;
  getDefinitionsInfos: typeof getters.getDefinitionsInfos;
  getImports: typeof getters.getImports;
  getDefinitionsVersionInformation: typeof getters.getDefinitionsVersionInformation;
  getProcessIds: typeof getters.getProcessIds;
  getDeploymentMethod: typeof getters.getDeploymentMethod;
  getProcessConstraints: typeof getters.getProcessConstraints;
  getProcessDocumentation: typeof getters.getProcessDocumentation;
  getProcessDocumentationByObject: typeof getters.getProcessDocumentationByObject;
  getUserTaskFileNameMapping: typeof getters.getUserTaskFileNameMapping;
  getAllUserTaskFileNamesAndUserTaskIdsMapping: typeof getters.getAllUserTaskFileNamesAndUserTaskIdsMapping;
  getSubprocess: typeof getters.getSubprocess;
  getSubprocessContent: typeof getters.getSubprocessContent;
  getTargetDefinitionsAndProcessIdForCallActivityByObject: typeof getters.getTargetDefinitionsAndProcessIdForCallActivityByObject;
  getDefinitionsAndProcessIdForEveryCallActivity: typeof getters.getDefinitionsAndProcessIdForEveryCallActivity;
  getStartEvents: typeof getters.getStartEvents;
  getAllBpmnFlowElements: typeof getters.getAllBpmnFlowElements;
  getAllBpmnFlowNodeIds: typeof getters.getAllBpmnFlowNodeIds;
  getAllBpmnFlowElementIds: typeof getters.getAllBpmnFlowElementIds;
  getChildrenFlowElements: typeof getters.getChildrenFlowElements;
  getElementMachineMapping: typeof getters.getElementMachineMapping;
  getTaskConstraintMapping: typeof getters.getTaskConstraintMapping;
  getIdentifyingInfos: typeof getters.getIdentifyingInfos;
  getRootFromElement: typeof getters.getRootFromElement;
  getMetaDataFromElement: typeof getters.getMetaDataFromElement;
  getMetaData: typeof getters.getMetaData;
  getMilestonesFromElement: typeof getters.getMilestonesFromElement;
  getMilestonesFromElementById: typeof getters.getMilestonesFromElementById;
  getResourcesFromElement: typeof getters.getResourcesFromElement;
  getLocationsFromElement: typeof getters.getLocationsFromElement;
  getPerformersFromElement: typeof getters.getPerformersFromElement;
  getPerformersFromElementById: typeof getters.getPerformersFromElementById;
  parseISODuration: typeof getters.parseISODuration;
  convertISODurationToMiliseconds: typeof getters.convertISODurationToMiliseconds;
  moddle: any;
  ensureCorrectProceedNamespace: typeof util.ensureCorrectProceedNamespace;
  toBpmnObject: typeof util.toBpmnObject;
  toBpmnXml: typeof util.toBpmnXml;
  getChildren: typeof util.getChildren;
  getElementsByTagName: typeof util.getElementsByTagName;
  getAllElements: typeof util.getAllElements;
  getElementById: typeof util.getElementById;
  getElementDI: typeof util.getElementDI;
  manipulateElementById: typeof util.manipulateElementById;
  manipulateElementsByTagName: typeof util.manipulateElementsByTagName;
};
export = _exports;
import proceedExtensions = require('./src/proceedExtensions');
import proceedConstants = require('./src/PROCEED-CONSTANTS.js');
import validators = require('./src/validators.js');
import setters = require('./src/setters.js');
import getters = require('./src/getters.js');
import util = require('./src/util.js');
