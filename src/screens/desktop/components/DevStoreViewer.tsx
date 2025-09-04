import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/shared/store';
import { Collapse, Switch, Button, Tooltip, Input, Tag, Space } from 'antd';
import { CopyOutlined, DownOutlined, RightOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import './styles/DevStoreViewer.css';

const { Panel } = Collapse;

interface JSONViewerProps {
  data: any;
  path?: string;
  isExpanded?: boolean;
  forceExpanded?: boolean;
}

// Component to display JSON data in a collapsible tree-like structure
const JSONViewer: React.FC<JSONViewerProps> = ({ data, path = '', isExpanded = false, forceExpanded }) => {
  const [expanded, setExpanded] = useState(isExpanded);
  
  // React to changes in forceExpanded prop
  useEffect(() => {
    if (forceExpanded !== undefined) {
      setExpanded(forceExpanded);
    }
  }, [forceExpanded]);
  
  if (data === null) return <span className="json-null">null</span>;
  if (data === undefined) return <span className="json-undefined">undefined</span>;
  
  if (typeof data !== 'object') {
    if (typeof data === 'string') return <span className="json-string">"{data}"</span>;
    if (typeof data === 'number') return <span className="json-number">{data}</span>;
    if (typeof data === 'boolean') return <span className="json-boolean">{data.toString()}</span>;
    return <span>{String(data)}</span>;
  }
  
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="json-array">[]</span>;
    
    return (
      <div className="json-array">
        <div className="json-toggle" onClick={() => setExpanded(!expanded)}>
          {expanded ? <DownOutlined /> : <RightOutlined />}
          <span>Array({data.length})</span>
        </div>
        {expanded && (
          <div className="json-children">
            {data.map((item, index) => (
              <div key={`${path}.${index}`} className="json-property">
                <span className="json-property-key">{index}:</span>
                <JSONViewer 
                  data={item} 
                  path={`${path}.${index}`} 
                  isExpanded={isExpanded}
                  forceExpanded={forceExpanded}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Object
  const keys = Object.keys(data);
  if (keys.length === 0) return <span className="json-object">{"{}"}</span>;
  
  return (
    <div className="json-object">
      <div className="json-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? <DownOutlined /> : <RightOutlined />}
        <span>Object({keys.length})</span>
      </div>
      {expanded && (
        <div className="json-children">
          {keys.map(key => (
            <div key={`${path}.${key}`} className="json-property">
              <span className="json-property-key">{key}:</span>
              <JSONViewer 
                data={data[key]} 
                path={`${path}.${key}`} 
                isExpanded={isExpanded}
                forceExpanded={forceExpanded} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main DevStoreViewer component
const DevStoreViewer: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [expandAll, setExpandAll] = useState(false);
  const [filter, setFilter] = useState('');
  const state = useSelector((state: RootState) => state);
  const prevStateRef = React.useRef<RootState | null>(null);
  const [showPrevious, setShowPrevious] = useState(false);

  useEffect(() => {
    prevStateRef.current = state;
  }, [state]);
  
  const copyState = () => {
    navigator.clipboard.writeText(JSON.stringify(state, null, 2));
  };
  
  // Type-safe way to render store content
  const renderStoreContent = () => {
    // Get all keys, but with proper typing
    const stateKeys = Object.keys(state) as Array<keyof typeof state>;
    const filteredKeys = stateKeys.filter(k => !filter || k.toString().toLowerCase().includes(filter.toLowerCase()));
    
    return (
      <Collapse activeKey={filter ? filteredKeys.map(k => k.toString()) : undefined}>
        {filteredKeys.map((key) => {
          const header = (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space size={6}>
                <Tag color="geekblue" style={{ marginRight: 4 }}>{key.toString()}</Tag>
              </Space>
              <Space size={6}>
                <Tooltip title="Copy this slice">
                  <Button size="small" icon={<CopyOutlined />} onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(JSON.stringify(state[key], null, 2)); }} />
                </Tooltip>
              </Space>
            </div>
          );
          return (
            <Panel header={header} key={key.toString()}>
              <div className={showPrevious ? 'dev-slice-grid' : ''}>
                <div>
                  <h4 style={{ margin: '4px 0 8px 0' }}>Current</h4>
                  <JSONViewer 
                    data={state[key]} 
                    path={key.toString()} 
                    isExpanded={expandAll || !!filter} 
                    forceExpanded={expandAll || !!filter} 
                  />
                </div>
                {showPrevious && (
                  <div>
                    <h4 style={{ margin: '4px 0 8px 0' }}>Previous</h4>
                    <JSONViewer 
                      data={prevStateRef.current ? (prevStateRef.current as any)[key] : undefined} 
                      path={`prev.${key.toString()}`} 
                      isExpanded={expandAll || !!filter} 
                      forceExpanded={expandAll || !!filter} 
                    />
                  </div>
                )}
              </div>
            </Panel>
          );
        })}
      </Collapse>
    );
  };
  
  return (
    <div className="dev-store-viewer">
      <div className="dev-store-viewer-header">
        <h2>Redux Store Viewer</h2>
        <div className="dev-store-viewer-controls">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Filter top-level keys..."
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: 220 }}
          />
          <Switch
            checked={enabled}
            onChange={setEnabled}
            checkedChildren="Enabled"
            unCheckedChildren="Disabled"
          />
          <Tooltip title="Copy state to clipboard">
            <Button 
              icon={<CopyOutlined />} 
              onClick={copyState}
            >
              Copy State
            </Button>
          </Tooltip>
          <Switch
            checked={expandAll}
            onChange={setExpandAll}
            checkedChildren="Expand All"
            unCheckedChildren="Collapse All"
          />
          <Switch
            checked={showPrevious}
            onChange={setShowPrevious}
            checkedChildren="Prev"
            unCheckedChildren="Prev"
          />
        </div>
      </div>
      
      {enabled && (
        <div className="dev-store-viewer-content">
          {renderStoreContent()}
        </div>
      )}
    </div>
  );
};

export default DevStoreViewer;
