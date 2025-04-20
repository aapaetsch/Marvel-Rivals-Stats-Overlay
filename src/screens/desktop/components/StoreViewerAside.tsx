import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'app/shared/store';
import { Collapse, Switch, Button, Tooltip } from 'antd';
import { CopyOutlined, DownOutlined, RightOutlined, EyeOutlined, EyeInvisibleOutlined, LeftOutlined } from '@ant-design/icons';
import './styles/StoreViewerAside.css';

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

// StoreViewerAside component
const StoreViewerAside: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [expandAll, setExpandAll] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const state = useSelector((state: RootState) => state);
  
  const copyState = () => {
    navigator.clipboard.writeText(JSON.stringify(state, null, 2));
  };
  
  // Type-safe way to render store content
  const renderStoreContent = () => {
    // Get all keys, but with proper typing
    const stateKeys = Object.keys(state) as Array<keyof typeof state>;
    
    return (
      <Collapse>
        {stateKeys.map((key) => (
          <Panel header={key.toString()} key={key.toString()}>
            <JSONViewer 
              data={state[key]} 
              path={key.toString()} 
              isExpanded={expandAll} 
              forceExpanded={expandAll} 
            />
          </Panel>
        ))}
      </Collapse>
    );
  };
  
  return (
    <aside className={`store-viewer-aside ${!isVisible ? 'collapsed' : ''}`}>
      <div className="store-viewer-header">
        <h2>Redux Store</h2>
        <div className="store-viewer-controls">
          <Button
            type="text"
            icon={isVisible ? <EyeInvisibleOutlined className="has-text-primary-color"/> : <EyeOutlined className="has-text-primary-color"/>}
            onClick={() => setIsVisible(!isVisible)}
            size="small"
            title={isVisible ? "Hide panel" : "Show panel"}
          />
          <Switch
            checked={expandAll}
            onChange={setExpandAll}
            checkedChildren="Expand All"
            unCheckedChildren="Collapse All"
          />
          <Tooltip title="Copy state to clipboard">
            <Button 
              icon={<CopyOutlined />} 
              onClick={copyState}
              size="small"
            >
              Copy
            </Button>
          </Tooltip>
        </div>
      </div>
      
      {isVisible && (
        <div className="store-viewer-content">
          {renderStoreContent()}
        </div>
      )}
    </aside>
  );
};

export default StoreViewerAside;