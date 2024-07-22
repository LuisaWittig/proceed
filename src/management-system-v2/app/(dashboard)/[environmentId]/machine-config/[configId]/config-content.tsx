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
} from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Input,
  Col,
  Row,
  Tooltip,
  theme,
  Tag,
  Space,
  Select,
  Card,
  SelectProps,
} from 'antd';
import useMobileModeler from '@/lib/useMobileModeler';
import { useEnvironment } from '@/components/auth-can';
import {
  TreeFindParameterStruct,
  TreeFindStruct,
  defaultConfiguration,
  defaultParameter,
  deleteParameter,
  findConfig,
  findParameter,
  getAllParameters,
} from '../configuration-helper';
import getAddButton from './add-button';
import Param from './parameter';
import CreateParameterModal, { CreateParameterModalReturnType } from './create-parameter-modal';
import Paragraph from 'antd/es/typography/Paragraph';

type MachineDataViewProps = {
  configId: string;
  selectedMachineConfig: TreeFindStruct;
  customConfig?: AbstractConfig;
  parentConfig: ParentConfig;
  backendSaveParentConfig: Function;
  editingEnabled: boolean;
  contentType: 'metadata' | 'parameters';
};

type TagRender = SelectProps['tagRender'];

export default function Content(props: MachineDataViewProps) {
  const router = useRouter();
  const environment = useEnvironment();
  const query = useSearchParams();
  const { token } = theme.useToken();

  const firstRenderEditing = useRef(true);
  const [createFieldOpen, setCreateFieldOpen] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [idVisible, setIdVisible] = useState<boolean>(true);

  const [parentNestedSelection, setParentNestedSelection] = useState<Parameter>();

  const parentConfig = { ...props.parentConfig };
  const editingConfig = props.selectedMachineConfig
    ? { ...props.selectedMachineConfig.selection }
    : props.customConfig
      ? { ...props.customConfig }
      : defaultConfiguration();
  let refEditingConfig = findConfig(editingConfig.id, parentConfig);
  const saveParentConfig = props.backendSaveParentConfig;
  const configId = props.configId;
  const [editingContent, setEditingContent] = useState<TargetConfig['parameters']>(
    props.contentType === 'metadata'
      ? editingConfig.metadata
      : 'parameters' in editingConfig
        ? (editingConfig as TargetConfig).parameters
        : {},
  );

  let paramIdToName: { [key: string]: string } = {};
  const parametersList: { label: string; value: string }[] = getAllParameters(
    parentConfig,
    'config',
    '',
  ).map((item: { key: string; value: Parameter }) => {
    paramIdToName[item.value.id ?? ''] = item.key;
    return { label: item.key, value: item.value.id ?? '' };
  });

  const onContentDelete = (param: Parameter) => {
    if (param.content.length <= 0 && param.id) {
      deleteParameter(param.id, parentConfig);
      let copyContent = { ...editingContent };
      for (let prop in copyContent) {
        if (param.id === copyContent[prop].id) {
          delete copyContent[prop];
          break;
        }
      }
      setEditingContent(copyContent);
      setUpdating(true);
    }
  };

  const linkedParametersTagRender: TagRender = (props: any) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        color="purple"
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginInlineEnd: 4 }}
      >
        {label}
      </Tag>
    );
  };

  const onClickAddField = (parent: Parameter | undefined, type: 'nested' | 'main') => {
    if (type === 'nested') {
      // setEditingContent({ ...parent.parameters });
      setParentNestedSelection(parent);
    }
    setCreateFieldOpen(true);
  };

  const saveAll = () => {
    if (refEditingConfig) {
      if (props.contentType === 'metadata') {
        refEditingConfig.selection.metadata = editingContent;
      } else {
        (refEditingConfig.selection as TargetConfig).parameters = editingContent;
      }
    }
    saveParentConfig(configId, parentConfig).then(() => {});
    router.refresh();
  };

  useEffect(() => {
    if (firstRenderEditing.current) {
      firstRenderEditing.current = false;
      return;
    }
    if (updating) {
      saveAll();
      setUpdating(false);
    }
  }, [updating]);

  const showMobileView = useMobileModeler();
  const editable = props.editingEnabled;

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
      let copyContent = { ...editingContent };
      let copyParam = { ...copyContent[editingKey] };
      delete copyContent[editingKey];
      copyContent[paramKey] = { ...copyParam };
      setEditingContent(copyContent);
      setUpdating(true);
    }
  };

  const createField = (values: CreateParameterModalReturnType[]): Promise<void> => {
    if (refEditingConfig) {
      const valuesFromModal = values[0];
      const field = defaultParameter(
        valuesFromModal.displayName,
        valuesFromModal.value,
        valuesFromModal.language,
        valuesFromModal.unit,
      );
      let copyContent = { ...editingContent };
      if (parentNestedSelection && parentNestedSelection.id) {
        let ref: TreeFindParameterStruct = undefined;
        for (let prop in copyContent) {
          if (copyContent[prop].id === parentNestedSelection.id) {
            ref = { selection: copyContent[prop], parent: editingConfig, type: 'parameter' };
          } else {
            ref = findParameter(parentNestedSelection.id, copyContent[prop], 'parameter');
          }
          if (ref) {
            break;
          }
        }
        if (!ref) return Promise.resolve();
        ref.selection.parameters[valuesFromModal.key ?? valuesFromModal.displayName] = field;
      } else {
        copyContent[valuesFromModal.key ?? valuesFromModal.displayName] = field;
      }
      setEditingContent(copyContent);
      setUpdating(true);
    }
    setCreateFieldOpen(false);
    return Promise.resolve();
  };

  const getNestedParameters = (key: string, field: Parameter) => {
    return (
      <>
        {field.parameters &&
          Object.entries(field.parameters).map(([subFieldKey, subField]) => {
            return getCustomField(subFieldKey, subField);
          })}
      </>
    );
  };

  const linkedParametersChange = (key: string, paramIdList: string[]) => {
    if (refEditingConfig) {
      let copyContent = { ...editingContent };
      copyContent[key].linkedParameters = paramIdList;
      setEditingContent(copyContent);
      setUpdating(true);
    }
  };

  const cardStyle = {
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'solid 1px #d9d9d9',
    margin: '10px 0 0 0',
  };

  const getCustomField = (key: string, field: Parameter) => {
    return (
      <>
        <Row gutter={[24, 24]} /* align="middle" */ style={{ margin: '10px 0 0 0' }}>
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
              backendSaveParentConfig={saveParentConfig}
              configId={configId}
              editingEnabled={editable}
              parentConfig={parentConfig}
              selectedConfig={refEditingConfig}
              field={field}
              onDelete={onContentDelete}
              label={key[0].toUpperCase() + key.slice(1)}
            />
            {(editable || (field.linkedParameters && field.linkedParameters.length > 0)) && (
              <Card style={cardStyle} size="small">
                <Row gutter={[24, 24]} align="middle">
                  <Col span={4} className="gutter-row">
                    Linked Parameters
                  </Col>
                  <Col span={20} className="gutter-row">
                    {editable && (
                      <Space>
                        <Select
                          mode="multiple"
                          allowClear
                          tagRender={linkedParametersTagRender}
                          style={{ minWidth: 250 }}
                          placeholder="Select to Add"
                          value={field.linkedParameters}
                          onChange={(idList: string[]) => linkedParametersChange(key, idList)}
                          options={parametersList}
                        />
                      </Space>
                    )}
                    {!editable &&
                      field.linkedParameters.map((paramId: string) => {
                        return (
                          <Space>
                            <Tag color="purple">{paramIdToName[paramId]}</Tag>
                          </Space>
                        );
                      })}
                  </Col>
                  {/* <Col span={1} className="gutter-row">
                    <Tooltip title="Delete">
                      <Button
                        size="small"
                        disabled={!editable}
                        icon={<DeleteOutlined />}
                        type="text"
                      />
                    </Tooltip>
                  </Col> */}
                </Row>
              </Card>
            )}
            {(editable || (field.parameters && Object.keys(field.parameters).length > 0)) && (
              <Card style={cardStyle} size="small">
                <Row gutter={[24, 24]} align="middle">
                  <Col span={4} className="gutter-row">
                    Nested Parameters
                  </Col>
                  <Col span={20} className="gutter-row">
                    {getNestedParameters(key, field)}
                    {editable && (
                      <Space>
                        {getAddButton('Add Parameter', undefined, (_: any) =>
                          onClickAddField(field, 'nested'),
                        )}
                      </Space>
                    )}
                  </Col>
                  {/* <Col span={1} className="gutter-row">
                    <Tooltip title="Delete">
                      <Button
                        size="small"
                        disabled={!editable}
                        icon={<DeleteOutlined />}
                        type="text"
                      />
                    </Tooltip>
                  </Col> */}
                </Row>
              </Card>
            )}
          </Col>
        </Row>
      </>
    );
  };

  const addButtonTitle = props.contentType == 'metadata' ? 'Add Meta Data' : 'Add Parameter';

  return (
    <>
      {idVisible && props.contentType === 'metadata' && (
        <Row gutter={[24, 24]} align="middle" style={{ margin: '10px 0' }}>
          <Col span={3} className="gutter-row">
            {' '}
            Internal ID
          </Col>
          <Col span={20} className="gutter-row">
            <Input value={editingConfig.id} disabled prefix={<KeyOutlined />} />
          </Col>
          <Col span={1}>
            <Tooltip title="Hide Internal ID">
              <Button
                size="small"
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
      {Object.entries(editingContent).map(([key, val]) => {
        return getCustomField(key, val);
      })}
      {editable && (
        <Row gutter={[24, 24]} align="middle" style={{ margin: '10px 0' }}>
          {/* <Col span={3} className="gutter-row" /> */}
          <Col span={21} className="gutter-row">
            {getAddButton(addButtonTitle, undefined, () => onClickAddField(undefined, 'main'))}
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
