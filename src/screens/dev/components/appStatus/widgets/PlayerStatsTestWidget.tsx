import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Divider, Form, Input, InputNumber, Select, Space } from 'antd';
import { getAllCharacterNames } from 'lib/characterIcons';
import { processInfoUpdate } from 'screens/background/stores/matchStatsSlice';

/**
 * PlayerStatsTestWidget provides a form to inject test player stats data
 * into the match stats slice for testing the player stats overlay.
 * 
 * Allows setting:
 * - Player name
 * - Character
 * - Ult charge %
 * - Kills
 * - Deaths
 * - Assists
 * - Final hits
 */
const PlayerStatsTestWidget: React.FC = () => {
  const dispatch = useDispatch();
  const characterOptions = useMemo(() => getAllCharacterNames().map(name => ({ label: name, value: name })), []);
  
  // Form state
  const [playerName, setPlayerName] = useState<string>('TestPlayer');
  const [uid, setUid] = useState<string>('test_player_001');
  const [character, setCharacter] = useState<string>(characterOptions[0]?.value || 'IRON MAN');
  const [ultCharge, setUltCharge] = useState<number>(75);
  const [kills, setKills] = useState<number>(5);
  const [deaths, setDeaths] = useState<number>(2);
  const [assists, setAssists] = useState<number>(8);
  const [finalHits, setFinalHits] = useState<number>(3);
  const [team, setTeam] = useState<number>(1);
  const [isAlive, setIsAlive] = useState<boolean>(true);

  /**
   * Inject the test player data into the match stats slice
   * by simulating an info update payload
   */
  const injectPlayerStats = () => {
    const rosterKey = `roster_${uid}`;
    const rosterData = {
      uid,
      name: playerName,
      character_name: character,
      character_id: character.toLowerCase().replace(/\s+/g, '_'),
      team,
      is_teammate: team === 1,
      is_local: false,
      is_alive: isAlive,
      kills,
      deaths,
      assists,
      ult_charge: ultCharge,
    };

    const payload = {
      info: {
        info: {
          match_info: {
            [rosterKey]: JSON.stringify(rosterData),
          },
        },
      },
      timestamp: Date.now(),
    };

    dispatch(processInfoUpdate(payload));
  };

  /**
   * Clear all test players from the match stats
   */
  const clearTestPlayers = () => {
    // We can't directly remove players, but we can trigger a match reset if needed
    // For now, just log that the user should manually reset or wait for next match
    console.log('To clear test players, use the Force Reset Match button or start a new match');
  };

  /**
   * Quick preset for common test scenarios
   */
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'highPerformer':
        setPlayerName('HighPerformer');
        setUid('test_player_high');
        setKills(15);
        setDeaths(2);
        setAssists(10);
        setFinalHits(8);
        setUltCharge(100);
        break;
      case 'struggling':
        setPlayerName('StrugglingPlayer');
        setUid('test_player_low');
        setKills(1);
        setDeaths(10);
        setAssists(3);
        setFinalHits(0);
        setUltCharge(25);
        break;
      case 'balanced':
        setPlayerName('BalancedPlayer');
        setUid('test_player_balanced');
        setKills(8);
        setDeaths(7);
        setAssists(12);
        setFinalHits(4);
        setUltCharge(60);
        break;
      default:
        break;
    }
  };

  return (
    <div className="status-card">
      <div className="status-card-header">
        <h4 style={{ margin: 0 }}>Player Stats Overlay Test Controls</h4>
      </div>
      <div className="status-card-body">
        <Form layout="vertical" size="small">
          <Form.Item label="Player UID" style={{ marginBottom: 8 }}>
            <Input value={uid} onChange={(e) => setUid(e.target.value)} />
          </Form.Item>
          
          <Form.Item label="Player Name" style={{ marginBottom: 8 }}>
            <Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
          </Form.Item>
          
          <Form.Item label="Character" style={{ marginBottom: 8 }}>
            <Select 
              options={characterOptions} 
              value={character} 
              onChange={(v) => setCharacter(v as string)}
              showSearch
            />
          </Form.Item>

          <Form.Item label="Team" style={{ marginBottom: 8 }}>
            <Select 
              value={team} 
              onChange={(v) => setTeam(v as number)} 
              options={[
                { value: 1, label: 'Ally (Team 1)' }, 
                { value: 2, label: 'Enemy (Team 2)' }
              ]} 
            />
          </Form.Item>

          <Form.Item label="Alive Status" style={{ marginBottom: 8 }}>
            <Select 
              value={isAlive} 
              onChange={(v) => setIsAlive(v as boolean)} 
              options={[
                { value: true, label: 'Alive' }, 
                { value: false, label: 'Dead' }
              ]} 
            />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />

          <Form.Item label="Ult Charge (%)" style={{ marginBottom: 8 }}>
            <InputNumber 
              value={ultCharge} 
              onChange={(v) => setUltCharge(v ?? 0)} 
              min={0} 
              max={100}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Kills" style={{ marginBottom: 8 }}>
            <InputNumber 
              value={kills} 
              onChange={(v) => setKills(v ?? 0)} 
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Deaths" style={{ marginBottom: 8 }}>
            <InputNumber 
              value={deaths} 
              onChange={(v) => setDeaths(v ?? 0)} 
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Assists" style={{ marginBottom: 8 }}>
            <InputNumber 
              value={assists} 
              onChange={(v) => setAssists(v ?? 0)} 
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Final Hits" style={{ marginBottom: 8 }}>
            <InputNumber 
              value={finalHits} 
              onChange={(v) => setFinalHits(v ?? 0)} 
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />

          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Button type="primary" block onClick={injectPlayerStats}>
              Inject Player Stats
            </Button>
            
            <Divider style={{ margin: '8px 0' }}>Quick Presets</Divider>
            
            <Space style={{ width: '100%' }} size="small">
              <Button size="small" onClick={() => applyPreset('highPerformer')}>
                High Performer
              </Button>
              <Button size="small" onClick={() => applyPreset('balanced')}>
                Balanced
              </Button>
              <Button size="small" onClick={() => applyPreset('struggling')}>
                Struggling
              </Button>
            </Space>

            <Divider style={{ margin: '8px 0' }} />

            <Button danger block onClick={clearTestPlayers} size="small">
              Clear Test Players
            </Button>
          </Space>
        </Form>
      </div>
    </div>
  );
};

export default PlayerStatsTestWidget;
