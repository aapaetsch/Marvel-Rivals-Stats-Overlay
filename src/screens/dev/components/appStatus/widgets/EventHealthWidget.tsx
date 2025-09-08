import React, { useEffect, useState, useMemo } from 'react';
import { Badge, Descriptions, Space, Typography, Tag } from 'antd';

const { Title, Text } = Typography;

type FeatureKey = {
  name: string;
  state: number;
};

type Feature = {
  name: string;
  state: number;
  keys: FeatureKey[];
};

type HealthResponse = {
  game_id: number;
  state: number; // 1 OK, else partial/disabled
  disabled: boolean;
  published: boolean;
  is_vgep: boolean;
  features: Feature[];
};

const IMPORTANT_KEYS = ['match_start', 'match_end', 'kill_feed', 'roster', 'player_stats', 'map', 'game_mode'];

const EventHealthWidget: React.FC = () => {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('https://game-events-status.overwolf.com/24890_prod.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      setData(j);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = window.setInterval(load, 30_000);
    return () => window.clearInterval(t);
  }, []);

  const summary = useMemo(() => {
    if (!data) return null;
    const featuresOk = data.features.filter(f => f.state === 1).length;
    const totalKeys = data.features.reduce((acc, f) => acc + (f.keys?.length || 0), 0);
    const enabledKeys = data.features.reduce((acc, f) => acc + (f.keys?.filter(k => k.state === 1).length || 0), 0);
    const important: Array<{ name: string; ok: boolean; feature?: string; }> = [];
    for (const f of data.features) {
      for (const k of f.keys || []) {
        if (IMPORTANT_KEYS.includes(k.name)) {
          important.push({ name: k.name, ok: k.state === 1, feature: f.name });
        }
      }
    }
    return { featuresOk, enabledKeys, totalKeys, important };
  }, [data]);

  const ok = data && data.state === 1 && !data.disabled;

  return (
    <div className="status-card">
      <div className="status-card-header">
        <Space>
          <Badge status={ok ? 'success' : 'warning'} />
          <Title level={4} style={{ margin: 0 }}>Game Events Health</Title>
        </Space>
      </div>
      <div className="status-card-body">
        {loading && <Text type="secondary">Loading…</Text>}
        {error && <Text type="danger">{error}</Text>}
        {data && summary && (
          <>
            <Descriptions size="small" column={1} labelStyle={{ width: 140 }}>
              <Descriptions.Item label="Overall">
                <Tag color={ok ? 'green' : 'orange'} style={{ color: 'black' }}>{ok ? 'Operational' : 'Partial/Disabled'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Features Enabled">{summary.featuresOk}/{data.features.length}</Descriptions.Item>
              <Descriptions.Item label="Keys Enabled">{summary.enabledKeys}/{summary.totalKeys}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 8 }}>
              <Text strong>Important Keys:</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {summary.important.map((k) => (
                  <Tag key={k.name} color={k.ok ? 'green' : 'volcano'} style={{ color: 'black' }}>{k.name}</Tag>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventHealthWidget;

