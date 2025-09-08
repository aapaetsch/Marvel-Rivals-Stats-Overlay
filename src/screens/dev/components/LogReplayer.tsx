import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Button, Space, Typography, Switch, Tooltip, Table, Tag, Input, Select } from 'antd';
import { UploadOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined, StepForwardOutlined, CaretRightOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import {
  processInfoUpdate,
  processEvents,
  resetRoundStats,
  forceResetMatch
} from 'screens/background/stores/matchStatsSlice';

const { Title, Text, Paragraph } = Typography;

type ParsedEntry = {
  type: 'info' | 'event';
  timestamp: number;
  raw: any;
};

const LogReplayer: React.FC = () => {
  const dispatch = useDispatch();
  const replayFileInputRef = useRef<HTMLInputElement>(null);

  const [parsed, setParsed] = useState<ParsedEntry[]>([]);
  const [onlyKillFeed, setOnlyKillFeed] = useState<boolean>(false);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [replayIndex, setReplayIndex] = useState<number>(0);
  const replayIndexRef = useRef<number>(0);
  useEffect(() => { replayIndexRef.current = replayIndex; }, [replayIndex]);
  const [replaySpeedMs, setReplaySpeedMs] = useState<number>(150);
  const [filterText, setFilterText] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'INFO' | 'EVENT' | 'KILL'>('ALL');
  const [stats, setStats] = useState<{ infos: number; events: number; killFeeds: number; otherEvents: number; }>({ infos: 0, events: 0, killFeeds: 0, otherEvents: 0 });
  const replayTimerRef = useRef<number | null>(null);

  const parseLogFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      const entries: ParsedEntry[] = [];

      for (const line of lines) {
        if (!line) continue;
        const tsMatch = line.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}),(\d{3})/);
        let timestamp = Date.now();
        if (tsMatch) {
          const [, dateStr, timeStr, msStr] = tsMatch as any;
          const iso = `${dateStr}T${timeStr}.${msStr}Z`;
          const parsedTs = Date.parse(iso);
          if (!Number.isNaN(parsedTs)) timestamp = parsedTs;
        }

        let firstBrace = line.indexOf('{');
        let lastBrace = line.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
          if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
            firstBrace = 0;
            lastBrace = line.length - 1;
          } else {
            continue;
          }
        }
        const jsonStr = line.slice(firstBrace, lastBrace + 1);
        let obj: any;
        try {
          obj = JSON.parse(jsonStr);
        } catch {
          continue;
        }

        const hasInfo = !!obj?.info;
        const hasEventsArray = Array.isArray(obj?.events)
          ? true
          : Array.isArray(obj?.events?.events);
        const singleEvent = obj?.event && typeof obj.event === 'object' && obj.event.name
          ? obj.event
          : (obj?.name ? obj : null);

        if (hasInfo) {
          entries.push({ type: 'info', timestamp, raw: obj });
          continue;
        }

        if (hasEventsArray) {
          const arr = Array.isArray(obj?.events) ? obj.events : obj?.events?.events;
          for (const event of arr) {
            entries.push({ type: 'event', timestamp, raw: event });
          }
          continue;
        }

        if (singleEvent) {
          entries.push({ type: 'event', timestamp, raw: singleEvent });
        }
      }

      const counters = { infos: 0, events: 0, killFeeds: 0, otherEvents: 0 };
      for (const e of entries) {
        if (e.type === 'info') counters.infos++;
        else {
          counters.events++;
          const name = e.raw?.name || e.raw?.data?.name;
          if (name === 'kill_feed' || name === 'kill') counters.killFeeds++; else counters.otherEvents++;
        }
      }
      setStats(counters);

      entries.sort((a, b) => a.timestamp - b.timestamp);
      setParsed(entries);
      setReplayIndex(0);
    } catch (err) {
      console.error('Failed to parse log:', err);
    }
  };

  const handleReplayFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    await parseLogFile(file);
    if (replayFileInputRef.current) replayFileInputRef.current.value = '';
  };

  const stepDispatch = (entry: ParsedEntry) => {
    if (entry.type === 'info') {
      dispatch(processInfoUpdate({ info: entry.raw, timestamp: entry.timestamp }));
    } else {
      const name = entry.raw?.name || entry.raw?.data?.name;
      if (onlyKillFeed && name !== 'kill_feed' && name !== 'kill') return;
      const eventsPayload = Array.isArray(entry.raw?.events)
        ? entry.raw
        : { events: [entry.raw] };
      dispatch(processEvents({ events: eventsPayload, timestamp: entry.timestamp }));
    }
  };

  const handleReplayStart = () => {
    if (isReplaying) return;
    setIsReplaying(true);
    const tick = () => {
      let idx = replayIndexRef.current;
      if (idx >= parsed.length) {
        setIsReplaying(false);
        if (replayTimerRef.current) {
          window.clearInterval(replayTimerRef.current);
          replayTimerRef.current = null;
        }
        return;
      }
      const entry = parsed[idx];
      stepDispatch(entry);
      idx += 1;
      replayIndexRef.current = idx;
      setReplayIndex(idx);
    };
    replayTimerRef.current = window.setInterval(tick, Math.max(25, replaySpeedMs));
  };

  const handleReplayPause = () => {
    setIsReplaying(false);
    if (replayTimerRef.current) {
      window.clearInterval(replayTimerRef.current);
      replayTimerRef.current = null;
    }
  };

  const handleReplayStop = () => {
    handleReplayPause();
    replayIndexRef.current = 0;
    setReplayIndex(0);
  };

  const handleStepOnce = () => {
    if (replayIndex < parsed.length) {
      const entry = parsed[replayIndex];
      stepDispatch(entry);
      replayIndexRef.current = replayIndex + 1;
      setReplayIndex(replayIndex + 1);
    }
  };

  const flattenToPairs = (obj: any, maxDepth = 3, prefix = '', out: Array<[string,string]> = []) => {
    if (obj === null || obj === undefined) return out;
    if (maxDepth < 0) return out;
    const isPrimitive = (v: any) => (
      typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === null
    );
    if (Array.isArray(obj)) {
      obj.forEach((v, i) => {
        if (isPrimitive(v)) {
          const val = typeof v === 'string' ? v.slice(0, 120) : String(v);
          out.push([`${prefix}[${i}]`, val]);
        } else {
          flattenToPairs(v, maxDepth - 1, `${prefix}[${i}]`, out);
        }
      });
      return out;
    }
    if (typeof obj === 'object') {
      Object.entries(obj).forEach(([k, v]) => {
        const key = prefix ? `${prefix}.${k}` : k;
        if (isPrimitive(v)) {
          const val = typeof v === 'string' ? v.slice(0, 120) : String(v);
          out.push([key, val]);
        } else {
          flattenToPairs(v, maxDepth - 1, key, out);
        }
      });
      return out;
    }
    // Fallback primitive
    out.push([prefix || '', String(obj)]);
    return out;
  };

  const tableData = useMemo(() => parsed.map((e, idx) => {
    const ts = new Date(e.timestamp).toLocaleTimeString();
    const name = e.type === 'event' ? (e.raw?.name || e.raw?.data?.name) : 'info';
    let details = '';
    if (e.type === 'event') {
      try {
        const d = typeof e.raw?.data === 'string' ? JSON.parse(e.raw.data) : (e.raw?.data || {});
        if (name === 'kill_feed' || name === 'kill') {
          const attacker = d.attacker || d.killer || d.source || d.attackerName || '?';
          const victim = d.victim || d.target || d.victimName || '?';
          const ability = d.ability || d.weapon || d.skill || '';
          const head = d.headshot ? ' HS' : '';
          const dmg = d.damage ? ` dmg:${d.damage}` : '';
          details = `${attacker} → ${victim}${ability ? ` (${ability})` : ''}${head}${dmg}`;
        } else {
          const pairs = flattenToPairs(d, 3);
          details = pairs.slice(0, 24).map(([k,v]) => `${k}=${v}`).join(', ');
          if (pairs.length > 24) details += ' …';
        }
      } catch {
        details = JSON.stringify(e.raw).slice(0, 300);
      }
    } else {
      const infoObj = e.raw?.info ?? e.raw;
      const pairs = flattenToPairs(infoObj, 3);
      // Prioritize roster/player fields near the front if present
      const prioritized = pairs.sort((a,b) => {
        const ak = a[0]; const bk = b[0];
        const aprio = /roster|player|hero|character|team|match_info/.test(ak) ? 0 : 1;
        const bprio = /roster|player|hero|character|team|match_info/.test(bk) ? 0 : 1;
        return aprio - bprio;
      });
      details = prioritized.slice(0, 28).map(([k,v]) => `${k}=${v}`).join(', ');
      if (prioritized.length > 28) details += ' …';
    }
    const isKill = name === 'kill_feed' || name === 'kill';
    return {
      key: idx,
      idx,
      type: e.type.toUpperCase(),
      ts,
      name,
      details,
      tag: e.type === 'info' ? 'INFO' : (isKill ? 'KILL' : 'EVENT'),
      raw: e.raw
    };
  }), [parsed]);

  const filteredData = useMemo(() => {
    const needle = filterText.trim().toLowerCase();
    return tableData.filter(r => {
      if (filterType !== 'ALL') {
        if (filterType === 'KILL' && r.tag !== 'KILL') return false;
        if (filterType === 'INFO' && r.type !== 'INFO') return false;
        if (filterType === 'EVENT' && (r.type !== 'EVENT' || r.tag === 'KILL')) return false;
      }
      if (!needle) return true;
      return (
        String(r.idx).includes(needle) ||
        (r.name || '').toLowerCase().includes(needle) ||
        (r.details || '').toLowerCase().includes(needle)
      );
    });
  }, [tableData, filterText, filterType]);

  const columns = [
    { title: '#', dataIndex: 'idx', key: 'idx', width: 60, fixed: 'left' as const, onCell: () => ({ className: 'dev-col-idx' }) },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 80, render: (v: string) => (
      <Tag color={v === 'INFO' ? 'geekblue' : 'gold'}>{v}</Tag>
    ) },
    { title: 'Time', dataIndex: 'ts', key: 'ts', width: 120 },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 160 },
    { title: 'Details', dataIndex: 'details', key: 'details' as const },
    { title: 'Tag', dataIndex: 'tag', key: 'tag', width: 80, render: (v: string) => (
      <Tag color={v === 'INFO' ? 'geekblue' : (v === 'KILL' ? 'volcano' : 'default')}>{v}</Tag>
    ) },
    { title: 'Actions', key: 'actions', width: 200, fixed: 'right' as const, render: (_: any, row: any) => (
      <Space size={4} wrap>
        <Tooltip title="Dispatch once">
          <Button size="small" icon={<CaretRightOutlined />} onClick={() => { const i = row.idx; if (i >= 0 && i < parsed.length) { stepDispatch(parsed[i]); replayIndexRef.current = i + 1; setReplayIndex(i + 1); } }} />
        </Tooltip>
        <Tooltip title="Jump to index">
          <Button size="small" onClick={() => { replayIndexRef.current = row.idx; setReplayIndex(row.idx); }}>#{row.idx}</Button>
        </Tooltip>
        <Tooltip title="Play from here">
          <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => { replayIndexRef.current = row.idx; setReplayIndex(row.idx); handleReplayStart(); }} />
        </Tooltip>
      </Space>
    )}
  ];

  useEffect(() => () => {
    if (replayTimerRef.current) window.clearInterval(replayTimerRef.current);
  }, []);

  const [tablePageSize, setTablePageSize] = useState<number>(15);
  const [tableHeight, setTableHeight] = useState<number>(400);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const recomputeHeights = () => {
    const rootTop = rootRef.current?.getBoundingClientRect().top ?? 0;
    const controlsH = controlsRef.current?.getBoundingClientRect().height ?? 0;
    const viewportH = window.innerHeight;
    const available = Math.max(220, viewportH - rootTop - 24);
    const tableY = Math.max(160, available - controlsH - 88);
    setTableHeight(tableY);
  };
  useEffect(() => {
    recomputeHeights();
    const onResize = () => recomputeHeights();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [parsed.length, tablePageSize]);

  const handlePaginationChange = (_page: number, pageSize?: number) => {
    if (pageSize && pageSize !== tablePageSize) setTablePageSize(pageSize);
    setTimeout(recomputeHeights, 0);
  };

  return (
    <div className="dev-window log-replayer" style={{ padding: 12 }} ref={rootRef}>
      <Title level={4}>Log Replay Simulator</Title>
      <Paragraph>Load a background.html.log to simulate Overwolf info/events (e.g., kill_feed) and verify UI updates.</Paragraph>

      <Space direction="vertical" size="small" style={{ width: '100%' }} ref={controlsRef}>
        <Space style={{ width: '100%' }}>
          <Space direction="vertical" size="small" style={{ width: '100%'}}>
            <Space direction="horizontal" size="small" style={{ width: '100%'}}>
              <Button icon={<UploadOutlined />} onClick={() => replayFileInputRef.current?.click()}>Load Log File</Button>
              <input
                type="file"
                ref={replayFileInputRef}
                style={{ display: 'none' }}
                accept=".log,.txt"
                onChange={handleReplayFileChange}
              />
              <Tooltip title="Dispatch reset of current match state">
                <Button onClick={() => dispatch(forceResetMatch())}>Force Reset Match</Button>
              </Tooltip>
              <Tooltip title="Zero out round stats but keep roster">
                <Button onClick={() => dispatch(resetRoundStats())}>Reset Round Stats</Button>
              </Tooltip>
            </Space>

            <Space>
              <Switch checked={onlyKillFeed} onChange={setOnlyKillFeed} />
              <Text>Only dispatch kill_feed events (still applies roster/info)</Text>
            </Space>

            <Space wrap>
              <Text>Replay interval (ms):</Text>
              <input
                type="number"
                min={25}
                step={25}
                value={replaySpeedMs}
                onChange={(e) => setReplaySpeedMs(Math.max(25, Number(e.target.value) || 150))}
                style={{ width: 100 }}
              />
              <Text>Filter:</Text>
              <Input.Search
                allowClear
                placeholder="Search name/details/index"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{ width: 260 }}
              />
              <Select
                value={filterType}
                onChange={(v) => setFilterType(v)}
                options={[
                  { value: 'ALL', label: 'All' },
                  { value: 'INFO', label: 'Info' },
                  { value: 'EVENT', label: 'Events' },
                  { value: 'KILL', label: 'Kill Feed' },
                ]}
                style={{ width: 140 }}
              />
            </Space>
          </Space>
          <Space direction="vertical" size="small" style={{ width: '100%'}}>
            {!!parsed.length && (
              <div style={{ maxHeight: 200, overflow: 'auto', background: '#111', padding: 8, borderRadius: 4 }}>
                {parsed.slice(Math.max(0, replayIndex - 10), Math.min(parsed.length, replayIndex + 10)).map((e, i) => {
                  const idx = Math.max(0, replayIndex - 10) + i;
                  const ts = new Date(e.timestamp).toLocaleTimeString();
                  const name = e.type === 'event' ? (e.raw?.name || e.raw?.data?.name) : 'info';
                  return (
                    <div key={idx} style={{ opacity: idx < replayIndex ? 0.6 : 1 }}>
                      <code>
                        [{idx}] {ts} {e.type.toUpperCase()} {name}
                      </code>
                    </div>
                  );
                })}
              </div>
            )}
          </Space>
        </Space>

        <div>
          <Text type="secondary">Parsed: {parsed.length} • Infos: {stats.infos} • Events: {stats.events} • kill_feed: {stats.killFeeds} • Other: {stats.otherEvents}</Text>
        </div>

        {!!parsed.length && (
          <div>
            <Table
              size="small"
              dataSource={filteredData}
              columns={columns as any}
              pagination={{
                pageSize: tablePageSize,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ['15','30','50','100','200'],
                onChange: handlePaginationChange,
                onShowSizeChange: (_current, size) => handlePaginationChange(1, size),
                position: ['bottomCenter']
              }}
              scroll={{ y: tableHeight }}
              rowClassName={(row: any) => row.idx === replayIndex ? 'ant-table-row-selected' : ''}
              onRow={(row: any) => ({ onClick: () => setReplayIndex(row.idx) })}
            />
          </div>
        )}

        <Space>
          {!isReplaying && <Button className="start-btn" type="primary" icon={<PlayCircleOutlined />} onClick={handleReplayStart} disabled={!parsed.length}>Start</Button>}
          {isReplaying && <Button icon={<PauseCircleOutlined />} onClick={handleReplayPause}>Pause</Button>}
          <Button icon={<StopOutlined />} onClick={handleReplayStop} disabled={!parsed.length}>Stop</Button>
          <Button icon={<StepForwardOutlined />} onClick={handleStepOnce} disabled={!parsed.length}>Step</Button>
          <Text>Index: {replayIndex}/{parsed.length}</Text>
        </Space>
      </Space>
    </div>
  );
};

export default LogReplayer;
