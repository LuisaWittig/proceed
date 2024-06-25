'use client';

import {
  MachineConfig,
  MachineConfigParameter,
} from '@/lib/data/machine-config-schema';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  PlusOutlined,
  MinusOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ArrowUpOutlined,
  EditOutlined,
  KeyOutlined,
  UserOutlined,
  DeleteOutlined,
  CopyOutlined,
  ColumnWidthOutlined,
} from '@ant-design/icons';
import { ResizableBox } from 'react-resizable';
import { Resizable } from 're-resizable';
import 'react-resizable/css/styles.css';

import styles from './ResizableBox.module.scss'; //Handle CSS

import TextArea from 'antd/es/input/TextArea';
import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Input,
  Select,
  Space,
  Divider,
  Col,
  Row,
  Tag,
  Tooltip,
  Layout,
  SelectProps,
  theme,
  Card,
} from 'antd';
import { ToolbarGroup } from '@/components/toolbar';
import VersionCreationButton from '@/components/version-creation-button';
import { spaceURL } from '@/lib/utils';
import useMobileModeler from '@/lib/useMobileModeler';
import { useEnvironment } from '@/components/auth-can';
import { defaultMachineConfig, findInTree } from './machine-tree-view';
import { Content, Header } from 'antd/es/layout/layout';
import Title from 'antd/es/typography/Title';
type MachineDataViewProps = {
  configId: string;
  selectedMachineConfig:
    | { parent: MachineConfig; selection: MachineConfig }
    | undefined;
  rootMachineConfig: MachineConfig;
  backendSaveMachineConfig: Function;
};

const LATEST_VERSION = { version: -1, name: 'Latest Version', description: '' };

export default function MachineDataEditor(props: MachineDataViewProps) {
  const router = useRouter();
  const environment = useEnvironment();
  const query = useSearchParams();

  const firstRender = useRef(true);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState<string | undefined>('');
  const [description, setDescription] = useState<string | undefined>('');

  const rootMachineConfig = { ...props.rootMachineConfig };
  const parentMachineConfig = props.selectedMachineConfig
    ? { ...props.selectedMachineConfig.parent }
    : defaultMachineConfig();
  const editingMachineConfig = props.selectedMachineConfig
    ? { ...props.selectedMachineConfig.selection }
    : defaultMachineConfig();
  let refEditingMachineConfig = findInTree(
    editingMachineConfig.id,
    rootMachineConfig,
    rootMachineConfig,
    0
  );
  const saveMachineConfig = props.backendSaveMachineConfig;
  const configId = props.configId;
  const selectedVersionId = query.get('version');
  const [nestedParameters, setNestedParameters] = useState<
    MachineConfigParameter[]
  >([]); // State for nested parameters

  //Added by Antoni
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const addNestedParameter = () => {
    setNestedParameters([
      ...nestedParameters,
      { key: '', value: '', unit: '', language: '', children: [] },
    ]);
  };

  const changeNestedParameter = (index: number, key: string, value: string) => {
    const newNestedParameters = [...nestedParameters];
    if (key === 'key') newNestedParameters[index].key = value;
    else if (key === 'value') newNestedParameters[index].value = value;
    else if (key === 'unit') newNestedParameters[index].unit = value;
    else if (key === 'language') newNestedParameters[index].language = value;
    setNestedParameters(newNestedParameters);
  };

  const saveParameters = () => {
    if (refEditingMachineConfig) {
      refEditingMachineConfig.selection.parameters = nestedParameters;
      saveMachineConfig(configId, rootMachineConfig).then(() => {});
      router.refresh();
    }
  };

  const removeNestedParameter = (index: number) => {
    setNestedParameters(nestedParameters.filter((_, i) => i !== index));
  };
  ////

  const selectedVersion =
    editingMachineConfig.versions.find(
      (version) => version.version === parseInt(selectedVersionId ?? '-1')
    ) ?? LATEST_VERSION;
  const filterOption: SelectProps['filterOption'] = (input, option) =>
    ((option?.label as string) ?? '')
      .toLowerCase()
      .includes(input.toLowerCase());

  const createConfigVersion = async (values: {
    versionName: string;
    versionDescription: string;
  }) => {
    console.log(values.versionName, values.versionDescription);
    router.refresh();
  };

  const changeName = (e: any) => {
    let newName = e.target.value;
    setName(newName);
  };

  const saveName = (e: any) => {
    if (editingName) {
      if (refEditingMachineConfig) {
        refEditingMachineConfig.selection.name = name ? name : '';
        saveMachineConfig(configId, rootMachineConfig).then(() => {});
        router.refresh();
      }
    }
  };

  const changeDescription = (e: any) => {
    let newDescription = e.target.value;
    setDescription(newDescription);
  };

  const saveDescription = (e: any) => {
    if (refEditingMachineConfig) {
      refEditingMachineConfig.selection.description = description
        ? description
        : '';
      saveMachineConfig(configId, rootMachineConfig).then(() => {});
      router.refresh();
    }
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setName(editingMachineConfig.name);
    setDescription(editingMachineConfig.description);
    if (refEditingMachineConfig)
      setNestedParameters(refEditingMachineConfig.selection.parameters);
  }, [props.selectedMachineConfig]);

  const showMobileView = useMobileModeler();

  const toggleEditingName = () => {
    // if (editingName) {
    //   saveMachineConfig(configId, rootMachineConfig).then(() => {});
    // }
    setEditingName(!editingName);
  };
  const [width, setWidth] = useState(window.innerWidth / 2);

  const handleResize = (delta: number) => {
    setWidth((prevWidth) => {
      const newWidth = prevWidth + delta;
      const maxWidth = window.innerWidth * 0.8;
      const minWidth = window.innerWidth * 0.2;
      return Math.min(Math.max(newWidth, minWidth), maxWidth);
    });
  };
  return (
    <Layout>
      <Header
        style={{
          background: '#fff',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Divider orientation="left" style={{ margin: '0 16px' }}>
          <Title level={3} style={{ margin: 0 }}>
            {editingMachineConfig.type === 'machine-config' ? (
              <Tag color="red">Machine</Tag>
            ) : editingMachineConfig.type === 'target-config' ? (
              <Tag color="purple">Target</Tag>
            ) : (
              ''
            )}
            &nbsp;Configuration&nbsp;
            {!editingName ? (
              <>{editingMachineConfig.name}</>
            ) : (
              <Input value={name} onChange={changeName} onBlur={saveName} />
            )}
            &nbsp;
            <Button>
              <EditOutlined onClick={toggleEditingName} />
            </Button>
            &nbsp;
            <ToolbarGroup>
              <Select
                popupMatchSelectWidth={false}
                placeholder="Select Version"
                showSearch
                filterOption={filterOption}
                value={{
                  value: selectedVersion.version,
                  label: selectedVersion.name,
                }}
                onSelect={(_, option) => {
                  // change the version info in the query but keep other info (e.g. the currently open subprocess)
                  const searchParams = new URLSearchParams(query);
                  if (!option.value || option.value === -1)
                    searchParams.delete('version');
                  else searchParams.set(`version`, `${option.value}`);
                  router.push(
                    spaceURL(
                      environment,
                      `/machine-config/${configId as string}${
                        searchParams.size ? '?' + searchParams.toString() : ''
                      }`
                    )
                  );
                }}
                options={[LATEST_VERSION]
                  .concat(editingMachineConfig.versions ?? [])
                  .map(({ version, name }) => ({
                    value: version,
                    label: name,
                  }))}
              />
              {!showMobileView && (
                <>
                  <Tooltip title="Create New Version">
                    <VersionCreationButton
                      icon={<PlusOutlined />}
                      createVersion={createConfigVersion}
                    ></VersionCreationButton>
                  </Tooltip>
                  <Tooltip title="Back to parent">
                    <Button icon={<ArrowUpOutlined />} disabled={true} />
                  </Tooltip>
                </>
              )}
            </ToolbarGroup>
          </Title>
        </Divider>
      </Header>
      <Content
        style={{
          margin: '24px 16px 0',
          padding: '16px',
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          minHeight: 'auto',
          height: 'auto',
        }}
      >
        <Card title="Metadata" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              {parentMachineConfig.id !== editingMachineConfig.id ? (
                <>
                  Parent:
                  <Input
                    value={parentMachineConfig.id}
                    disabled
                    prefix={<KeyOutlined />}
                  />
                </>
              ) : (
                ''
              )}
              ID:
              <Input
                value={editingMachineConfig.id}
                disabled
                prefix={<KeyOutlined />}
              />
              Owner:
              <Input
                value={editingMachineConfig.owner.split('|').pop()}
                disabled
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={8}>
              <label>
                Description:
                <TextArea
                  value={description}
                  onChange={changeDescription}
                  onBlur={saveDescription}
                />
              </label>
            </Col>
          </Row>
          <Title level={5}>Linked Machine Configurations</Title>
          <Space wrap>
            <Tag color="green">ID ABC</Tag>
            <Tag color="purple">ID XYZ</Tag>
            <Tag color="magenta">ID LMN</Tag>
            <Button icon={<PlusOutlined />} type="dashed" />
          </Space>
        </Card>
        <div
          style={{
            display: 'flex',
            position: 'relative',
          }}
        >
          <ResizableBox
            className="custom-box"
            width={width}
            height={Infinity}
            axis="x"
            handle={
              <ColumnWidthOutlined
                style={{
                  position: 'absolute',
                  top: 0,
                  right: -8,
                  cursor: 'col-resize',
                }}
                onMouseDown={(e) => {
                  const startX = e.clientX;
                  const onMouseMove = (event: MouseEvent) => {
                    handleResize(event.clientX - startX);
                    e.clientX = event.clientX;
                  };
                  const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
              />
            }
            handleSize={[8, 8]}
            resizeHandles={['e']}
            style={{
              border: '1px solid #ddd',
              padding: '16px',
              background: '#fff',
              borderRadius: '8px',
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'auto',
            }}
          >
            <Card
              title="Parameters"
              bodyStyle={{
                paddingBottom: 16,
                maxHeight: '600px',
                overflowY: 'auto',
              }}
            >
              <Button
                icon={<PlusOutlined />}
                type="dashed"
                style={{ width: '100%', marginBottom: 16 }}
                onClick={addNestedParameter}
              >
                Add Parameter
              </Button>

              {nestedParameters.map((param, i) => (
                <Card
                  key={i}
                  type="inner"
                  title={`Nested Parameter ${i + 1}`}
                  extra={
                    <Button
                      icon={<MinusOutlined />}
                      type="dashed"
                      onClick={() => removeNestedParameter(i)}
                    />
                  }
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                      <Input
                        placeholder="Key"
                        value={param.key}
                        onChange={(e) =>
                          changeNestedParameter(i, 'key', e.target.value)
                        }
                      />
                    </Col>
                    <Col span={6}>
                      <Input
                        placeholder="Value"
                        value={param.value}
                        onChange={(e) =>
                          changeNestedParameter(i, 'value', e.target.value)
                        }
                      />
                    </Col>
                    <Col span={6}>
                      <Input
                        placeholder="Unit"
                        value={param.unit}
                        onChange={(e) =>
                          changeNestedParameter(i, 'unit', e.target.value)
                        }
                      />
                    </Col>
                    <Col span={6}>
                      <Input
                        placeholder="Language"
                        value={param.language}
                        onChange={(e) =>
                          changeNestedParameter(i, 'language', e.target.value)
                        }
                      />
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={24}>
                      <Space>
                        <Tag color="purple">Key XY</Tag>
                        <Tag color="blue">Key AB</Tag>
                        <Button icon={<PlusOutlined />} type="dashed" />
                      </Space>
                    </Col>
                  </Row>
                  <Row gutter={16} justify="start">
                    <Space>
                      <Tooltip title="Copy">
                        <Button icon={<CopyOutlined />} shape="circle" />
                      </Tooltip>
                      <Tooltip title="Edit">
                        <Button icon={<EditOutlined />} shape="circle" />
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button icon={<DeleteOutlined />} shape="circle" />
                      </Tooltip>
                    </Space>
                    <Button type="link" icon={<PlusOutlined />}>
                      Create Custom Parameter
                    </Button>
                  </Row>
                </Card>
              ))}
            </Card>
          </ResizableBox>
          <ResizableBox
            className="custom-box"
            width={window.innerWidth - width}
            height={Infinity}
            axis="x"
            minConstraints={[window.innerWidth * 0.2, 0]}
            maxConstraints={[window.innerWidth * 0.8, Infinity]}
            handle={
              <ColumnWidthOutlined
                style={{
                  position: 'absolute',
                  top: 0,
                  left: -8,
                  cursor: 'col-resize',
                }}
                onMouseDown={(e) => {
                  const startX = e.clientX;
                  const onMouseMove = (event: MouseEvent) => {
                    handleResize(startX - event.clientX);
                    e.clientX = event.clientX;
                  };
                  const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
              />
            }
            handleSize={[8, 8]}
            resizeHandles={['w']}
            style={{
              border: '1px solid #ddd',
              padding: '16px',
              background: '#fff',
              borderRadius: '8px',
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              maxHeight: 'calc(100vh - 160px)', // Adjust based on your layout
              overflow: 'auto',
            }}
          >
            <Card
              title="Machine Configuration"
              bodyStyle={{
                paddingBottom: 16,
                maxHeight: '600px',
                overflowY: 'auto',
              }}
            >
              <Button
                icon={<PlusOutlined />}
                type="dashed"
                style={{ width: '100%', marginBottom: 16 }}
                onClick={addNestedParameter}
              >
                Add Parameter
              </Button>

              {nestedParameters.map((param, i) => (
                <Card
                  key={i}
                  type="inner"
                  title={`Nested Parameter ${i + 1}`}
                  extra={
                    <Button
                      icon={<MinusOutlined />}
                      type="dashed"
                      onClick={() => removeNestedParameter(i)}
                    />
                  }
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                      <Input
                        placeholder="Key"
                        value={param.key}
                        onChange={(e) =>
                          changeNestedParameter(i, 'key', e.target.value)
                        }
                      />
                    </Col>
                    <Col span={6}>
                      <Input
                        placeholder="Value"
                        value={param.value}
                        onChange={(e) =>
                          changeNestedParameter(i, 'value', e.target.value)
                        }
                      />
                    </Col>
                    <Col span={6}>
                      <Input
                        placeholder="Unit"
                        value={param.unit}
                        onChange={(e) =>
                          changeNestedParameter(i, 'unit', e.target.value)
                        }
                      />
                    </Col>
                    <Col span={6}>
                      <Input
                        placeholder="Language"
                        value={param.language}
                        onChange={(e) =>
                          changeNestedParameter(i, 'language', e.target.value)
                        }
                      />
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={24}>
                      <Space>
                        <Tag color="purple">Key XY</Tag>
                        <Tag color="blue">Key AB</Tag>
                        <Button icon={<PlusOutlined />} type="dashed" />
                      </Space>
                    </Col>
                  </Row>
                  <Row gutter={16} justify="start">
                    <Space>
                      <Tooltip title="Copy">
                        <Button icon={<CopyOutlined />} shape="circle" />
                      </Tooltip>
                      <Tooltip title="Edit">
                        <Button icon={<EditOutlined />} shape="circle" />
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button icon={<DeleteOutlined />} shape="circle" />
                      </Tooltip>
                    </Space>
                    <Button type="link" icon={<PlusOutlined />}>
                      Create Custom Parameter
                    </Button>
                  </Row>
                </Card>
              ))}
            </Card>
          </ResizableBox>
        </div>
      </Content>
    </Layout>
  );
}
