'use client';

import { ParentConfig } from '@/lib/data/machine-config-schema';
import { useEffect, useState } from 'react';
import { Layout, Button } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import ConfigEditor from './config-editor';
import ConfigurationTreeView, { TreeFindStruct } from './machine-tree-view';
import { useRouter } from 'next/navigation';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './ConfigContent.css';

const { Sider } = Layout;

type VariablesEditorProps = {
  configId: string;
  originalParentConfig: ParentConfig;
  backendSaveParentConfig: Function;
};

const initialWidth = 400; // Initial width
const collapsedWidth = 70; // Width when collapsed

export default function ConfigContent(props: VariablesEditorProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const router = useRouter();
  const [selectedConfig, setSelectedConfig] = useState<TreeFindStruct>(undefined);

  const configId = props.configId;
  const saveConfig = props.backendSaveParentConfig;
  const [parentConfig, setParentConfig] = useState<ParentConfig>(props.originalParentConfig);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setSelectedConfig({ parent: parentConfig, selection: parentConfig });
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onSelectConfig = (relation: TreeFindStruct) => {
    setSelectedConfig(relation);
  };

  const treeOnUpdate = (editedConfig: ParentConfig) => {
    const date = new Date().toUTCString();
    router.refresh();
    setLastUpdate(date);
    setParentConfig(editedConfig);
  };

  const [width, setWidth] = useState(initialWidth);

  const handleResize = (delta: number) => {
    setWidth((prevWidth) => {
      const newWidth = prevWidth + delta;
      const maxWidth = isClient ? window.innerWidth / 2 : initialWidth;
      const minWidth = 200;
      if (newWidth > collapsedWidth) {
        setCollapsed(false);
      }
      return Math.min(Math.max(newWidth, minWidth), maxWidth);
    });
  };

  const handleCollapse = () => {
    if (collapsed) {
      setWidth(initialWidth);
    } else {
      setWidth(collapsedWidth);
    }
    setCollapsed(!collapsed);
  };
  if (!isClient) {
    return null;
  }
  return (
    <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'row' }}>
      <ResizableBox
        className="custom-box"
        width={collapsed ? collapsedWidth : width}
        height={Infinity}
        axis="x"
        minConstraints={[collapsedWidth, 0]}
        maxConstraints={[window.innerWidth / 2, Infinity]}
        resizeHandles={['e']}
        handle={
          !collapsed && (
            <div
              className="custom-handle"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '8px',
                height: '100%',
                cursor: 'col-resize',
                zIndex: 1,
              }}
              onMouseDown={(e) => {
                let startX = e.clientX;
                const onMouseMove = (event) => {
                  const delta = event.clientX - startX;
                  handleResize(delta);
                  startX = event.clientX;
                };
                const onMouseUp = () => {
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onMouseUp);
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
              }}
            />
          )
        }
        onResizeStop={(event, { size }) => {
          setWidth(size.width);
          if (size.width <= collapsedWidth) {
            setCollapsed(true); // Collapse when the width is less than or equal to collapsedWidth
          } else {
            setCollapsed(false); // Ensure tree is visible when expanded via handle
          }
        }}
        style={{
          border: collapsed ? 'none' : '1px solid #ddd',
          padding: '0',
          background: collapsed ? 'none' : '#fff',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'auto',
          height: '100vh',
        }}
      >
        <Button
          type="default"
          onClick={handleCollapse}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 2,
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
        {!collapsed && (
          <div className="content-wrapper">
            <ConfigurationTreeView
              onUpdate={treeOnUpdate}
              onSelectConfig={onSelectConfig}
              backendSaveParentConfig={saveConfig}
              configId={configId}
              parentConfig={parentConfig}
            />
          </div>
        )}
      </ResizableBox>

      <ConfigEditor
        backendSaveParentConfig={saveConfig}
        configId={configId}
        parentConfig={parentConfig}
        selectedConfig={selectedConfig}
        style={{
          marginLeft: collapsed ? `${collapsedWidth}px` : `${width}px`,
          transition: 'margin-left 0.3s ease',
        }}
      />
    </Layout>
  );
}
