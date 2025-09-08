import React, { useEffect, useState } from 'react';
import { Badge, Descriptions, Space, Typography } from 'antd';

declare const overwolf: any | undefined;

type RunningGameInfo = {
  isRunning?: boolean;
  classId?: number;
  gameTitle?: string;
  shortTitle?: string;
  width?: number;
  height?: number;
  logicalWidth?: number;
  logicalHeight?: number;
  windowMode?: string;
  processId?: number;
  monitorHandle?: number;
};

const { Title, Text } = Typography;

const GameStatusWidget: React.FC = () => {
  const [info, setInfo] = useState<RunningGameInfo | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const poll = async () => {
    try {
      if (typeof overwolf === 'undefined' || !overwolf?.games?.getRunningGameInfo) {
        setIsRunning(false);
        setInfo(null);
        return;
      }
      overwolf.games.getRunningGameInfo((res: any) => {
        const running = !!res && !!res.isRunning;
        setIsRunning(running);
        if (running) setInfo(res as RunningGameInfo); else setInfo(null);
      });
    } catch {
      setIsRunning(false);
      setInfo(null);
    }
  };

  useEffect(() => {
    poll();
    const t = window.setInterval(poll, 2000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="status-card">
      <div className="status-card-header">
        <Space>
          <Badge status={isRunning ? 'success' : 'default'} />
          <Title level={4} style={{ margin: 0 }}>Game Running Status</Title>
        </Space>
      </div>
      <div className="status-card-body">
        {!isRunning && (
          <Text type="secondary">Game not running</Text>
        )}
        {isRunning && (
          <Descriptions size="small" column={1} labelStyle={{ width: 140 }}>
            <Descriptions.Item label="Title">{info?.gameTitle || info?.shortTitle || 'Marvel Rivals'}</Descriptions.Item>
            <Descriptions.Item label="Class ID">{info?.classId ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Mode">{info?.windowMode ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="Resolution">
              {(info?.width || '?') + ' x ' + (info?.height || '?')}
              {info?.logicalWidth && info?.logicalHeight ? `  (logical ${info.logicalWidth} x ${info.logicalHeight})` : ''}
            </Descriptions.Item>
            <Descriptions.Item label="Process ID">{info?.processId ?? '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </div>
    </div>
  );
};

export default GameStatusWidget;

