'use client';

import { ParentConfig } from '@/lib/data/machine-config-schema';

import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ColumnWidthOutlined,
  ExpandOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Button, Layout } from 'antd';
import ConfigEditor from './config-editor';
import ConfigurationTreeView, { TreeFindStruct } from './machine-tree-view';
import { useRouter } from 'next/navigation';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
const { Sider } = Layout;

type VariablesEditorProps = {
  configId: string;
  originalParentConfig: ParentConfig;
  backendSaveParentConfig: Function;
};
const initialWidth = 400; // Initial width

export default function ConfigContent(props: VariablesEditorProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const router = useRouter();
  const [selectedConfig, setSelectedConfig] = useState<TreeFindStruct>(undefined);

  const configId = props.configId;
  const saveConfig = props.backendSaveParentConfig;
  const [parentConfig, setParentConfig] = useState<ParentConfig>(props.originalParentConfig);

  useEffect(() => {
    setSelectedConfig({ parent: parentConfig, selection: parentConfig });
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

  const [width, setWidth] = useState(initialWidth); // Initial width

  const handleResize = (delta: number) => {
    setWidth((prevWidth) => {
      const newWidth = prevWidth + delta;
      const maxWidth = window.innerWidth / 2;
      const minWidth = 200;
      return Math.min(Math.max(newWidth, minWidth), maxWidth);
    });
  };

  const handleCollapse = () => {
    setWidth(initialWidth);
  };

  return (
    <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'row' }}>
      <ResizableBox
        className="custom-box"
        width={width}
        height={Infinity}
        axis="x"
        minConstraints={[200, 0]}
        maxConstraints={[window.innerWidth / 2, Infinity]}
        handle={
          <ColumnWidthOutlined
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
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
          padding: '0',
          background: '#fff',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'auto',
          height: '100vh',
        }}
      >
        <ConfigurationTreeView
          onUpdate={treeOnUpdate}
          onSelectConfig={onSelectConfig}
          backendSaveParentConfig={saveConfig}
          configId={configId}
          parentConfig={parentConfig}
        />
      </ResizableBox>

      <ConfigEditor
        backendSaveParentConfig={saveConfig}
        configId={configId}
        parentConfig={parentConfig}
        selectedConfig={selectedConfig}
        style={{ marginLeft: collapsed ? `${width}px` : '0', transition: 'margin-left 0.3s ease' }}
      />
    </Layout>
  );
}
