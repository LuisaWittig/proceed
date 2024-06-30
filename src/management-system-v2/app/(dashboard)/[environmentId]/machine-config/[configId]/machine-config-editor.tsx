'use client';

import { ParentConfig } from '@/lib/data/machine-config-schema';

import { MenuUnfoldOutlined, MenuFoldOutlined, ColumnWidthOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { Button, Layout, Typography } from 'antd';
import ConfigurationTreeView from './machine-tree-view';
import MachineDataEditor from './machine-metadata-editor';
import 'react-resizable/css/styles.css';

const { Sider } = Layout;
import { ResizableBox } from 'react-resizable';

type VariablesEditorProps = {
  configId: string;
  originalParentConfig: ParentConfig;
  backendSaveParentConfig: Function;
  backendCreateParentConfig: Function;
};

export default function ParentConfigEditor(props: VariablesEditorProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<
    { parent: ParentConfig; selection: ParentConfig } | undefined
  >(undefined);

  const configId = props.configId;
  const saveParentConfig = props.backendSaveParentConfig;
  const machineConfig = { ...props.originalParentConfig };

  useEffect(() => {
    setSelectedConfig({ parent: machineConfig, selection: machineConfig });
  }, []);

  const onSelectConfig = (relation: { parent: ParentConfig; selection: ParentConfig }) => {
    setSelectedConfig(relation);
  };
  const [width, setWidth] = useState(300); // Initialize with a smaller width
  const handleResize = (delta: number) => {
    setWidth((prevWidth) => {
      const newWidth = prevWidth + delta;
      const maxWidth = window.innerWidth * 0.8;
      const minWidth = 200; // Minimum width to show the tree
      return Math.min(Math.max(newWidth, minWidth), maxWidth);
    });
  };
  
  return (
    <Layout style={{ height: '100vh' }}>
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
        <Sider
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={width} // Use dynamic width here
          trigger={null}
          style={{ background: '#fff', display: collapsed ? 'none' : 'block' }}
        >
          <div style={{ width: '100%', padding: '0' }}>
            {!collapsed && (
              <>
                <ConfigurationTreeView
                  onUpdate={treeOnUpdate}
                  onSelectConfig={onSelectConfig}
                  backendSaveParentConfig={saveConfig}
                  configId={configId}
                  parentConfig={parentConfig}
                />
              </>
            )}
          </div>
        </Sider>
      </ResizableBox>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: '24px' }}
      />
      <ConfigEditor
        backendSaveParentConfig={saveConfig}
        configId={configId}
        parentConfig={parentConfig}
        selectedConfig={selectedConfig}
      />
    </Layout>
  );
  