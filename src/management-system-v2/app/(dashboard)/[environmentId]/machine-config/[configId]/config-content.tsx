'use client';

import {
  AbstractConfig,
  Parameter,
  ParentConfig,
  TargetConfig,
} from '@/lib/data/machine-config-schema';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  KeyOutlined,
  EyeInvisibleOutlined,
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { Button, Input, Col, Row, Tooltip, Collapse, theme, Tag, Space, Select } from 'antd';
import useMobileModeler from '@/lib/useMobileModeler';
import { useEnvironment } from '@/components/auth-can';
import {
  TreeFindStruct,
  defaultConfiguration,
  defaultParameter,
  deleteParameter,
  findConfig,
  getAllParameters,
} from '../configuration-helper';
import getAddButton from './add-button';
import Param from './parameter';
import CreateParameterModal, { CreateParameterModalReturnType } from './create-parameter-modal';
import Paragraph from 'antd/es/typography/Paragraph';

const ConfigPredefinedLiterals = [
  'description',
  'owner',
  'userIdentification',
  'machine',
  'picture',
];

type MachineDataViewProps = {
  configId: string;
  selectedMachineConfig: TreeFindStruct;
  customConfig?: AbstractConfig;
  rootMachineConfig: ParentConfig;
  backendSaveMachineConfig: Function;
  editingEnabled: boolean;
  contentType: 'metadata' | 'parameters';
};

export default function Content(props: MachineDataViewProps) {
  const router = useRouter();
  const environment = useEnvironment();
  const query = useSearchParams();
  const { token } = theme.useToken();

  const firstRender = useRef(true);
  const [createFieldOpen, setCreateFieldOpen] = useState<boolean>(false);
  const [idVisible, setIdVisible] = useState<boolean>(true);

  const rootMachineConfig = { ...props.rootMachineConfig };
  const editingMachineConfig = props.selectedMachineConfig
    ? { ...props.selectedMachineConfig.selection }
    : props.customConfig
      ? { ...props.customConfig }
      : defaultConfiguration();
  let refEditingMachineConfig = findConfig(editingMachineConfig.id, rootMachineConfig);
  const saveMachineConfig = props.backendSaveMachineConfig;
  const configId = props.configId;
  const [editingContent, setEditingContent] = useState<TargetConfig['parameters']>(
    props.contentType === 'metadata'
      ? editingMachineConfig.metadata
      : 'parameters' in editingMachineConfig
        ? (editingMachineConfig as TargetConfig).parameters
        : {},
  );

  const parametersList: { label: string; value: string }[] = getAllParameters(
    rootMachineConfig,
    'config',
    '',
  ).map((item: { key: string; value: Parameter }) => {
    return { label: item.key, value: item.value.id ?? '' };
  });

  const onContentDelete = (param: Parameter) => {
    if (param.content.length <= 0 && param.id) {
      deleteParameter(param.id, rootMachineConfig);
      let copyContent = { ...editingContent };
      for (let prop in copyContent) {
        if (param.id === copyContent[prop].id) {
          delete copyContent[prop];
          break;
        }
      }
      setEditingContent(copyContent);
    }
  };

  const onClickAddField = (e: any) => {
    setCreateFieldOpen(true);
  };

  const saveAll = () => {
    if (refEditingMachineConfig) {
      if (props.contentType === 'metadata') {
        refEditingMachineConfig.selection.metadata = editingContent;
      } else {
        (refEditingMachineConfig.selection as TargetConfig).parameters = editingContent;
      }
      saveMachineConfig(configId, rootMachineConfig).then(() => {});
      router.refresh();
    }
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
  }, [props.selectedMachineConfig]);

  useEffect(() => {
    saveAll();
  }, [editingContent]);

  const showMobileView = useMobileModeler();
  const editable = props.editingEnabled;

  //TODO
  const [paramKey, setParamKey] = useState<string | undefined>('');
  const [oldParamKey, setOldParamKey] = useState<string | undefined>('');

  const pushKey = () => {
    setOldParamKey(paramKey);
  };

  const restoreKey = () => {
    setParamKey(oldParamKey);
  };

  const saveKey = (editingKey: string) => {
    if (paramKey) {
      console.log(editingKey, paramKey);
      let copyContent = { ...editingContent };
      let copyParam = { ...copyContent[editingKey] };
      delete copyContent[editingKey];
      copyContent[paramKey] = { ...copyParam };
      setEditingContent(copyContent);
    }
  };

  const createField = (values: CreateParameterModalReturnType[]): Promise<void> => {
    if (refEditingMachineConfig) {
      const valuesFromModal = values[0];
      const field = defaultParameter(
        valuesFromModal.displayName,
        valuesFromModal.value,
        valuesFromModal.language,
        valuesFromModal.unit,
      );
      let copyContent = { ...editingContent };
      copyContent[valuesFromModal.key ?? valuesFromModal.displayName] = field;
      setEditingContent(copyContent);
    }
    setCreateFieldOpen(false);
    return Promise.resolve();
  };

  const getNestedParameters = (key: string, field: Parameter) => {
    return (
      <>
        {Object.entries(field.parameters).map(([subFieldKey, subField]) => {
          return getCustomField(subFieldKey, subField);
        })}
      </>
    );
  };

  const getCustomField = (key: string, field: Parameter) => {
    console.log(key, field.parameters && Object.keys(field.parameters).length > 0);
    return (
      <>
        <Row gutter={[24, 24]} /* align="middle" */ style={{ margin: '16px 0' }}>
          <Col span={3} className="gutter-row">
            <Paragraph
              onBlur={() => saveKey(key)}
              editable={
                editable && {
                  icon: <EditOutlined style={{ color: 'rgba(0, 0, 0, 0.88)', margin: '0 10px' }} />,
                  tooltip: 'Edit Parameter Key',
                  onStart: pushKey,
                  onCancel: restoreKey,
                  onChange: setParamKey,
                  onEnd: () => saveKey(key),
                  enterIcon: <CheckOutlined />,
                }
              }
            >
              {key[0].toUpperCase() + key.slice(1) /*TODO */}
            </Paragraph>
          </Col>
          <Col span={21} className="gutter-row">
            <Param
              backendSaveParentConfig={saveMachineConfig}
              configId={configId}
              editingEnabled={editable}
              parentConfig={rootMachineConfig}
              selectedConfig={refEditingMachineConfig}
              field={field}
              onDelete={onContentDelete}
              label={key[0].toUpperCase() + key.slice(1)}
            />
          </Col>
        </Row>
        {(editable || (field.linkedParameters && field.linkedParameters.length > 0)) && (
          <Row gutter={[24, 24]} align="middle" style={{ margin: '10px 0' }}>
            <Col span={3} className="gutter-row">
              Linked Parameters
            </Col>
            <Col span={20} className="gutter-row">
              <Space>
                <Select
                  mode="multiple"
                  allowClear
                  style={{ minWidth: 250 }}
                  placeholder="Please select"
                  value={field.linkedParameters}
                  // onChange={handleChange}
                  options={parametersList}
                />
              </Space>
            </Col>
            <Col span={1} className="gutter-row">
              <Tooltip title="Delete">
                <Button disabled={!editable} icon={<DeleteOutlined />} type="text" />
              </Tooltip>
            </Col>
          </Row>
        )}
        {(editable || (field.parameters && Object.keys(field.parameters).length > 0)) && (
          <Row gutter={[24, 24]} align="middle" style={{ margin: '10px 0' }}>
            <Col span={3} className="gutter-row">
              Nested Parameters ({key})
            </Col>
            <Col span={20} className="gutter-row">
              {getNestedParameters(key, field)}
              {editable && (
                <Space style={{ margin: '10px 0 0 0' }}>
                  {getAddButton('Add Parameter', undefined, () => {})}
                </Space>
              )}
            </Col>
            <Col span={1} className="gutter-row">
              <Tooltip title="Delete">
                <Button disabled={!editable} icon={<DeleteOutlined />} type="text" />
              </Tooltip>
            </Col>
          </Row>
        )}
      </>
    );
  };

  const addButtonTitle = props.contentType == 'metadata' ? 'Add Meta Data' : 'Add Parameter';

  return (
    <>
      {idVisible && props.contentType === 'metadata' && (
        <Row gutter={[24, 24]} align="middle" style={{ margin: '16px 0' }}>
          <Col span={3} className="gutter-row">
            {' '}
            Internal ID
          </Col>
          <Col span={20} className="gutter-row">
            <Input value={editingMachineConfig.id} disabled prefix={<KeyOutlined />} />
          </Col>
          <Col span={1}>
            <Tooltip title="Hide Internal ID">
              <Button
                disabled={!editable}
                onClick={() => {
                  setIdVisible(false);
                }}
                icon={<EyeInvisibleOutlined />}
                type="text"
              />
            </Tooltip>
          </Col>
        </Row>
      )}
      {Object.entries(editingContent).map(([key, val], idx: number) => {
        return getCustomField(key, val);
      })}
      {editable && (
        <Row gutter={[24, 24]} align="middle" style={{ margin: '16px 0' }}>
          <Col span={3} className="gutter-row" />
          <Col span={21} className="gutter-row">
            {getAddButton(addButtonTitle, undefined, onClickAddField)}
          </Col>
        </Row>
      )}
      <CreateParameterModal
        title={props.contentType == 'metadata' ? 'Create Meta Data' : 'Create Parameter'}
        open={createFieldOpen}
        onCancel={() => setCreateFieldOpen(false)}
        onSubmit={createField}
        okText="Create"
        showKey
      />
    </>
  );
}

/*const { token } = theme.useToken();
  const panelStyle = {
    marginBottom: 20,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  const getItems = (panelStyle: {
    marginBottom: number;
    background: string;
    borderRadius: number;
    border: string;
  }): any => [
    {
      key: '1',
      label: props.contentType === 'metadata' ? 'Meta Data' : 'Parameters',
      children: [
        <>
          {idVisible && props.contentType === 'metadata' && (
            <Row gutter={[24, 24]} align="middle" style={{ margin: '16px 0' }}>
              <Col span={3} className="gutter-row">
                {' '}
                Internal ID
              </Col>
              <Col span={20} className="gutter-row">
                <Input value={editingMachineConfig.id} disabled prefix={<KeyOutlined />} />
              </Col>
              <Col span={1}>
                <Tooltip title="Hide Internal ID">
                  <Button
                    disabled={!editable}
                    onClick={() => {
                      setIdVisible(false);
                    }}
                    icon={<EyeInvisibleOutlined />}
                    type="text"
                  />
                </Tooltip>
              </Col>
            </Row>
          )}
          {Object.entries(editingContent).map(([key, val], idx: number) => {
            return getCustomField(key, val, idx);
          })}
          {editable && (
            <Row gutter={[24, 24]} align="middle" style={{ margin: '16px 0' }}>
              <Col span={3} className="gutter-row" />
              <Col span={21} className="gutter-row">
                {getAddButton(addButtonTitle, undefined, onClickAddField)}
              </Col>
            </Row>
          )}
          <CreateParameterModal
            title={props.contentType == 'metadata' ? 'Create Meta Data' : 'Create Parameter'}
            open={createFieldOpen}
            onCancel={() => setCreateFieldOpen(false)}
            onSubmit={createField}
            okText="Create"
            showKey
          />
        </>,
      ],
      style: panelStyle,
    },
  ];

  return (
    <Collapse
      bordered={false}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      defaultActiveKey={['1']}
      style={{
        background: 'none',
      }}
      items={getItems(panelStyle)}
    />
  );
}
*/
