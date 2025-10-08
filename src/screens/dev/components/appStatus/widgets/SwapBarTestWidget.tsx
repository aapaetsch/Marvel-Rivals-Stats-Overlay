import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Divider, Form, Input, Select, Space, Radio } from 'antd';
import { getAllCharacterNames } from 'lib/characterIcons';
import { devAddCharacterSwap, devClearCharacterSwaps, devSetMatchInfo, devClearMatchInfo, devSetSwapDisplayDuration, devClearSwapDisplayDuration } from 'screens/background/stores/matchStatsSlice';

const SwapBarTestWidget: React.FC = () => {
  const dispatch = useDispatch();
  const characterOptions = useMemo(() => getAllCharacterNames().map(name => ({ label: name, value: name })), []);
  const [oldChar, setOldChar] = useState<string>(characterOptions[0]?.value || 'IRON MAN');
  const [newChar, setNewChar] = useState<string>(characterOptions[1]?.value || 'CAPTAIN AMERICA');
  const [team, setTeam] = useState<number>(1);
  const [mapMode, setMapMode] = useState<boolean>(false);
  const [mapName, setMapName] = useState<string>('Conquest City');
  const [gameMode, setGameMode] = useState<string>('Conquest');
  const [uid, setUid] = useState<string>('dev_user');
  const [playerName, setPlayerName] = useState<string>('DevPlayer');
  const [swapDurationSec, setSwapDurationSec] = useState<number>(5);
  const [swapMaxVisible, setSwapMaxVisible] = useState<number>(3);

  const triggerSwap = () => {
    dispatch(devAddCharacterSwap({ uid, name: playerName, oldCharacterName: oldChar, newCharacterName: newChar, team }));
  };

  const showMapInfo = () => {
    dispatch(devSetMatchInfo({ map: mapName, gameMode, gameType: 'PvP' }));
  };

  const clearMapInfo = () => {
    dispatch(devClearMatchInfo());
  };

  const clearSwaps = () => {
    dispatch(devClearCharacterSwaps());
  };

  const setSwapDuration = () => {
    const ms = Math.max(0, Math.floor(swapDurationSec * 1000));
    dispatch(devSetSwapDisplayDuration(ms));
  };

  const clearSwapDuration = () => {
    dispatch(devClearSwapDisplayDuration());
  };

  const setMaxVisible = () => {
    const n = Math.max(0, Math.floor(swapMaxVisible));
    dispatch((require('screens/background/stores/matchStatsSlice') as any).devSetMaxVisibleSwaps(n));
  };

  const clearMaxVisible = () => {
    dispatch((require('screens/background/stores/matchStatsSlice') as any).devClearMaxVisibleSwaps());
  };

  return (
    <div className="status-card">
      <div className="status-card-header">
        <h4 style={{ margin: 0 }}>Character Swap Bar Override Controls</h4>
      </div>
      <div className="status-card-body">
        <Form layout="vertical">
          <Form.Item label="Player UID">
            <Input value={uid} onChange={(e) => setUid(e.target.value)} />
          </Form.Item>
          <Form.Item label="Player Name">
            <Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
          </Form.Item>
          <Form.Item label="Old Character">
            <Select options={characterOptions} value={oldChar} onChange={(v) => setOldChar(v as string)} />
          </Form.Item>
          <Form.Item label="New Character">
            <Select options={characterOptions} value={newChar} onChange={(v) => setNewChar(v as string)} />
          </Form.Item>
          <Form.Item label="Team">
            <Select value={team} onChange={(v) => setTeam(v as number)} options={[{ value: 1, label: 'Ally' }, { value: 2, label: 'Enemy' }]} />
          </Form.Item>

          <Divider />

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" block onClick={triggerSwap}>Trigger Swap</Button>
            <Button danger block onClick={clearSwaps}>Clear Dev Swaps</Button>
          </Space>

          <Divider />

          <Form.Item label="Display Mode">
            <Radio.Group value={mapMode ? 'map' : 'swap'} onChange={(e) => setMapMode(e.target.value === 'map')}>
              <Radio value={'swap'}>Show Swap</Radio>
              <Radio value={'map'}>Show Map/Match Info</Radio>
            </Radio.Group>
          </Form.Item>

              {mapMode && (
            <>
              <Form.Item label="Map Name">
                <Input value={mapName} onChange={(e) => setMapName(e.target.value)} />
              </Form.Item>
              <Form.Item label="Game Mode">
                <Input value={gameMode} onChange={(e) => setGameMode(e.target.value)} />
              </Form.Item>
              <Button block onClick={showMapInfo}>Show Map Info</Button>
              <Button block style={{ marginTop: 8 }} onClick={clearMapInfo}>Clear Map Info</Button>
            </>
          )}

          <Divider />

          <Form.Item label="Swap Display Duration (seconds)">
            <Input type="number" value={swapDurationSec} onChange={(e) => setSwapDurationSec(Number(e.target.value || 0))} min={0} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button type="primary" onClick={setSwapDuration}>Set Swap Duration</Button>
              <Button onClick={clearSwapDuration}>Clear Swap Duration</Button>
            </div>
          </Form.Item>

          <Divider />

          <Form.Item label="Max Visible Swaps">
            <Input type="number" value={swapMaxVisible} onChange={(e) => setSwapMaxVisible(Number(e.target.value || 0))} min={0} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button type="primary" onClick={setMaxVisible}>Set Max Visible</Button>
              <Button onClick={clearMaxVisible}>Clear Max Visible</Button>
            </div>
          </Form.Item>

        </Form>
      </div>
    </div>
  );
};

export default SwapBarTestWidget;