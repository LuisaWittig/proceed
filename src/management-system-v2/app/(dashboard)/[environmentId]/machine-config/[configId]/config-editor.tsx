'use client';

import { MachineConfig, MachineConfigParameter } from '@/lib/data/machine-config-schema';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  PlusOutlined,
  ArrowUpOutlined,
  EditOutlined,
  KeyOutlined,
  UserOutlined,
  DeleteOutlined,
  CopyOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
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
  Collapse,
  theme,
  Card,
  Dropdown,
} from 'antd';
import { ToolbarGroup } from '@/components/toolbar';
import VersionCreationButton from '@/components/version-creation-button';
import { spaceURL } from '@/lib/utils';
import useMobileModeler from '@/lib/useMobileModeler';
import { useEnvironment } from '@/components/auth-can';
import { defaultMachineConfig, findInTree } from './machine-tree-view';
import { Content, Header } from 'antd/es/layout/layout';
import Title from 'antd/es/typography/Title';
import MetaData from './metadata';
import MachineConfigurations from './mach-config';
import TargetConfiguration from './target-config';
import Text from 'antd/es/typography/Text';

type MachineDataViewProps = {
  configId: string;
  selectedMachineConfig: { parent: MachineConfig; selection: MachineConfig } | undefined;
  rootMachineConfig: MachineConfig;
  backendSaveMachineConfig: Function;
};

const LATEST_VERSION = { version: -1, name: 'Latest Version', description: '' };

export default function ConfigEditor(props: MachineDataViewProps) {
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
    0,
  );
  const saveMachineConfig = props.backendSaveMachineConfig;
  const configId = props.configId;
  const selectedVersionId = query.get('version');

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const selectedVersion =
    editingMachineConfig.versions.find(
      (version) => version.version === parseInt(selectedVersionId ?? '-1'),
    ) ?? LATEST_VERSION;
  const filterOption: SelectProps['filterOption'] = (input, option) =>
    ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase());

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

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setName(editingMachineConfig.name);
    setDescription(editingMachineConfig.description);
  }, [props.selectedMachineConfig]);

  const showMobileView = useMobileModeler();

  const toggleEditingName = () => {
    // if (editingName) {
    //   saveMachineConfig(configId, rootMachineConfig).then(() => {});
    // }
    setEditingName(!editingName);
  };

  const machConfigsHeader = (
    <Space.Compact block size="small">
      <Text>Machine Configurations</Text>
      <Tooltip title="Add Machine Configuration">
        <Button icon={<PlusOutlined />} type="text" style={{ margin: '0 16px' }} />
      </Tooltip>
    </Space.Compact>
  );

  const { token } = theme.useToken();
  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  const getItems = (panelStyle: {
    marginBottom: number;
    background: string;
    borderRadius: number;
    border: string;
  }) => [
    {
      key: '1',
      label: 'Meta Data',
      children: (
        <MetaData
          backendSaveMachineConfig={saveMachineConfig}
          configId={configId}
          rootMachineConfig={rootMachineConfig}
          selectedMachineConfig={props.selectedMachineConfig}
        />
      ),
      style: panelStyle,
    },
    {
      key: '2',
      label: 'Target Configuration',
      children: (
        <TargetConfiguration
          backendSaveMachineConfig={saveMachineConfig}
          configId={configId}
          rootMachineConfig={rootMachineConfig}
          selectedMachineConfig={props.selectedMachineConfig}
        />
      ),
      style: panelStyle,
    },
    {
      key: '3',
      label: machConfigsHeader,
      children: (
        <MachineConfigurations
          backendSaveMachineConfig={saveMachineConfig}
          configId={configId}
          rootMachineConfig={rootMachineConfig}
          selectedMachineConfig={props.selectedMachineConfig}
        />
      ),
      style: panelStyle,
    },
  ];

  return (
    <Layout>
      <Header
        style={{
          background: '#fff',
          margin: '0 16px',
          padding: '0 16px',
          borderRadius: borderRadiusLG,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Title level={4} style={{ margin: '0 16px' }}>
          {!editingName ? (
            <>{editingMachineConfig.name}</>
          ) : (
            <Input value={name} onChange={changeName} onBlur={saveName} />
          )}
        </Title>
        <Tooltip title="Edit Name">
          <Button
            type="text"
            icon={<EditOutlined onClick={toggleEditingName} />}
            style={{ margin: '0 16px 0 0' }}
          />
        </Tooltip>
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
              // change the version info in the query but keep other info
              const searchParams = new URLSearchParams(query);
              if (!option.value || option.value === -1) searchParams.delete('version');
              else searchParams.set(`version`, `${option.value}`);
              router.push(
                spaceURL(
                  environment,
                  `/machine-config/${configId as string}${
                    searchParams.size ? '?' + searchParams.toString() : ''
                  }`,
                ),
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
              <Tooltip title="Back to Parent">
                <Button icon={<ArrowUpOutlined />} disabled={true} />
              </Tooltip>
            </>
          )}
        </ToolbarGroup>
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
        <Collapse
          bordered={false}
          defaultActiveKey={['1']}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          style={{
            background: token.colorBgContainer,
          }}
          items={getItems(panelStyle)}
        />
      </Content>
    </Layout>
  );
}
