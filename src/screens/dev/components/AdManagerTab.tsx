import React, { useState } from 'react';
import { Select, Button, Typography, Tag, Alert, Space } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { IN_HOUSE_ADS, type InHouseAd } from 'lib/inHouseAds';
import { InHouseAdComponent } from 'components/Ads';
import './appStatus/styles/AppStatus.css';
import './styles/AdManager.css';

// Overwolf ad definitions for preview
const OVERWOLF_ADS: InHouseAd[] = [
  {
    id: 'overwolf-horizontal-728x90',
    name: 'Overwolf Horizontal Banner',
    width: 728,
    height: 90,
    type: 'horizontal',
    title: 'Overwolf Ad',
    subtitle: 'External advertisement'
  },
  {
    id: 'overwolf-horizontal-780x90',
    name: 'Overwolf Extended Banner',
    width: 780,
    height: 90,
    type: 'horizontal',
    title: 'Overwolf Ad',
    subtitle: 'External advertisement'
  },
  {
    id: 'overwolf-vertical-300x250',
    name: 'Overwolf Medium Rectangle',
    width: 300,
    height: 250,
    type: 'vertical',
    title: 'Overwolf Ad',
    subtitle: 'External advertisement'
  },
  {
    id: 'overwolf-vertical-300x600',
    name: 'Overwolf Large Vertical',
    width: 300,
    height: 600,
    type: 'vertical',
    title: 'Overwolf Ad',
    subtitle: 'External advertisement'
  },
  {
    id: 'overwolf-ingame-300x250',
    name: 'Overwolf In-Game Ad',
    width: 300,
    height: 250,
    type: 'horizontal',
    title: 'Overwolf Ad',
    subtitle: 'External advertisement'
  }
];

// Combine all ads for preview
const ALL_ADS = [...IN_HOUSE_ADS, ...OVERWOLF_ADS];

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Ad Manager Tab - Dev Tool for testing and managing ads
 */
const AdManagerTab: React.FC = () => {
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [selectedContainerSize, setSelectedContainerSize] = useState<string>('780x90');
  const [previewKey, setPreviewKey] = useState(0);

  // Parse container size
  const [previewWidth, previewHeight] = selectedContainerSize.split('x').map(Number);

  // Helper functions for preview scaling
  const getPreviewWidth = (adWidth: number) => {
    const maxWidth = 400; // Increase max preview width
    const scale = adWidth > maxWidth ? maxWidth / adWidth : 1;
    return `${Math.min(adWidth * scale, maxWidth)}px`;
  };

  const getPreviewHeight = (adHeight: number) => {
    const maxHeight = 300; // Increase max preview height
    const scale = adHeight > maxHeight ? maxHeight / adHeight : 1;
    return `${Math.min(adHeight * scale, maxHeight)}px`;
  };

  // Get filtered ads for selected size
  const availableAds = ALL_ADS.filter(
    ad => ad.width === previewWidth && ad.height === previewHeight
  );

  const selectedAd = selectedAdId 
    ? ALL_ADS.find(ad => ad.id === selectedAdId) 
    : null;

  const handleRefresh = () => {
    setPreviewKey(prev => prev + 1);
  };

  const handleAdSelect = (adId: string) => {
    setSelectedAdId(adId);
    handleRefresh();
  };

  const containerSizes = [
    { label: '780x90 Horizontal', value: '780x90' },
    { label: '728x90 Horizontal', value: '728x90' },
    { label: '400x300 Rectangle', value: '400x300' },
    { label: '400x600 Large', value: '400x600' },
    { label: '300x600 Vertical', value: '300x600' },
    { label: '300x250 Medium', value: '300x250' },
    { label: '160x600 Skyscraper', value: '160x600' },
  ];

  return (
    <div className="ad-manager-root dev-window" style={{ padding: 12 }}>
      <Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>Ad Manager</Title>
      
      <div className="app-status-2col" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Left Column: Controls and Preview */}
        <div className="left-col">
          <div className="status-card" style={{ marginBottom: 12 }}>
            <div className="status-card-header">
              <Title level={5} style={{ margin: 0, fontSize: 14 }}>Ad Controls</Title>
            </div>
            <div className="status-card-body">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Container Size Selection */}
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>Container Size:</Text>
                  <Select
                    value={selectedContainerSize}
                    onChange={(value) => {
                      setSelectedContainerSize(value);
                      setSelectedAdId(null);
                    }}
                    style={{ width: '100%' }}
                  >
                    {containerSizes.map(size => (
                      <Option key={size.value} value={size.value}>
                        {size.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                {/* Ad Selection */}
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>Available In-House Ads:</Text>
                  {availableAds.length === 0 ? (
                    <Alert
                      message="No In-House Ads Available"
                      description={`No in-house ads configured for size ${selectedContainerSize}`}
                      type="warning"
                      showIcon
                    />
                  ) : (
                    <Space wrap>
                      {availableAds.map(ad => (
                        <Button
                          key={ad.id}
                          type={selectedAdId === ad.id ? 'primary' : 'default'}
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleAdSelect(ad.id)}
                        >
                          {ad.name}
                        </Button>
                      ))}
                    </Space>
                  )}
                </div>

                {/* Refresh Button */}
                {selectedAd && (
                  <div>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={handleRefresh}
                      size="small"
                    >
                      Refresh Preview
                    </Button>
                  </div>
                )}
              </Space>
            </div>
          </div>

          {/* Ad Preview */}
          <div className="status-card" style={{ height: '100%' }}>
            <div className="status-card-header">
              <Title level={5} style={{ margin: 0, fontSize: 14 }}>Ad Preview</Title>
            </div>
            <div className="status-card-body ad-preview-container">
              {!selectedAd ? (
                <div style={{ textAlign: 'center', color: 'var(--primary-color-medium)' }}>
                  <div>Select an ad to preview</div>
                </div>
              ) : (
                <div style={{ 
                  width: '100%', 
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '320px', // Increased height for better visibility
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '10px'
                }}>
                  <div className="ad-preview-wrapper" style={{
                    width: getPreviewWidth(selectedAd.width),
                    height: getPreviewHeight(selectedAd.height),
                    maxWidth: '100%',
                    maxHeight: '100%',
                    overflow: 'hidden',
                    borderRadius: 'var(--border-radius)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1000,
                      display: 'flex',
                      gap: '4px'
                    }}>
                      <Tag color="green">
                        {selectedAd.id.includes('overwolf') ? 'Overwolf' : 'In-House'}
                      </Tag>
                      <Tag>
                        {selectedAd.type}
                      </Tag>
                    </div>
                    {selectedAd.id.includes('overwolf') ? (
                      // Overwolf ad preview
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'var(--background-secondary)',
                        border: '2px dashed var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: '80%',
                          height: '60%',
                          background: 'var(--background-tertiary)',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '10px'
                        }}>
                          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                            Overwolf Ad
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', textAlign: 'center' }}>
                          <div>{selectedAd.name}</div>
                          <div style={{ marginTop: '4px', opacity: 0.7 }}>
                            {selectedAd.width}x{selectedAd.height}
                          </div>
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          fontSize: '10px',
                          opacity: 0.5
                        }}>
                          External Ad Content
                        </div>
                      </div>
                    ) : (
                      // In-house ad preview
                      <InHouseAdComponent 
                        key={previewKey}
                        ad={selectedAd} 
                        showDevBadge={true}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Statistics and Ad Info */}
        <div className="right-col">
          {/* Statistics */}
          <div className="status-card" style={{ marginBottom: 12 }}>
            <div className="status-card-header">
              <Title level={5} style={{ margin: 0, fontSize: 14 }}>Ad Statistics</Title>
            </div>
            <div className="status-card-body">
              <div className="ad-stats-grid">
                <div className="ad-stat-item">
                  <div className="ad-stat-label">Total Ads:</div>
                  <div className="ad-stat-value">{ALL_ADS.length}</div>
                </div>
                <div className="ad-stat-item">
                  <div className="ad-stat-label">In-House:</div>
                  <div className="ad-stat-value">{IN_HOUSE_ADS.length}</div>
                </div>
                <div className="ad-stat-item">
                  <div className="ad-stat-label">Overwolf:</div>
                  <div className="ad-stat-value">{OVERWOLF_ADS.length}</div>
                </div>
                <div className="ad-stat-item">
                  <div className="ad-stat-label">Horizontal:</div>
                  <div className="ad-stat-value">{ALL_ADS.filter(ad => ad.type === 'horizontal').length}</div>
                </div>
                <div className="ad-stat-item">
                  <div className="ad-stat-label">Vertical:</div>
                  <div className="ad-stat-value">{ALL_ADS.filter(ad => ad.type === 'vertical').length}</div>
                </div>
                <div className="ad-stat-item">
                  <div className="ad-stat-label">All Ads:</div>
                  <div className="ad-stat-value">{ALL_ADS.filter(ad => ad.type === 'vertical').length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ad Info - Always Visible */}
          <div className="status-card">
            <div className="status-card-header">
              <Title level={5} style={{ margin: 0, fontSize: 14 }}>Ad Information</Title>
            </div>
            <div className="status-card-body">
              {selectedAd ? (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div><Text strong>ID:</Text> <Text code>{selectedAd.id}</Text></div>
                  <div><Text strong>Name:</Text> {selectedAd.name}</div>
                  <div><Text strong>Size:</Text> {selectedAd.width}x{selectedAd.height}</div>
                  <div><Text strong>Type:</Text> <Tag color="blue">{selectedAd.type}</Tag></div>
                  <div><Text strong>Source:</Text> <Tag color={selectedAd.id.includes('overwolf') ? 'orange' : 'green'}>
                    {selectedAd.id.includes('overwolf') ? 'Overwolf' : 'In-House'}
                  </Tag></div>
                  <div><Text strong>Title:</Text> {selectedAd.title}</div>
                  <div><Text strong>Subtitle:</Text> {selectedAd.subtitle}</div>
                  {selectedAd.buttonText && (
                    <div><Text strong>Button Text:</Text> {selectedAd.buttonText}</div>
                  )}
                  {selectedAd.buttonUrl && (
                    <div><Text strong>Button URL:</Text> <Text code>{selectedAd.buttonUrl}</Text></div>
                  )}
                </Space>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--primary-color-medium)', padding: '20px 0' }}>
                  <div>Select an ad to view details</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdManagerTab;
