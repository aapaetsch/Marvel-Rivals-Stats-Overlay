import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootReducer } from 'app/shared/rootReducer';
import TeammateStats from 'screens/ingame/components/TeammateStats';
import { PlayerStatsProps as IngamePlayerStatsProps } from 'screens/ingame/types/teamateStatsTypes';
import { SwapBar } from 'components/CharacterSwapBar/SwapBar';
import { FinalHitsBar } from 'screens/finalhitsbar/components/FinalHitsBar';
import PlayerCard from 'screens/desktop/components/matchTabNew/components/PlayerCard';
import { PlayerCardData } from 'screens/desktop/components/matchTabNew/types/MatchCardTypes';
import { Button, Divider, Form, Input, InputNumber, Segmented, Select, Slider, Switch, ColorPicker } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { updateSettings } from 'features/appSettings/appSettingsSlice';
import { getAllCharacterNames } from 'lib/characterIcons';
import './styles/DevPlayground.css';

type PlaygroundComponent = 'playerStatus' | 'swapBar' | 'playerCard' | 'finalHits';

const DevPlayground: React.FC = () => {
  const dispatch = useDispatch();
  const appSettings = useSelector((s: RootReducer) => s.appSettingsReducer.settings);
  const [active, setActive] = useState<PlaygroundComponent>('playerStatus');
  const characterOptions = useMemo(() => getAllCharacterNames().map(name => ({ value: name, label: name })), []);
  // Sample for ingame player status card(s)
  const [sampleTeamPlayers, setSampleTeamPlayers] = useState<IngamePlayerStatsProps[]>([
    {
      rosterId: 'user',
      playerName: 'You',
      characterName: 'IRON MAN',
      ultCharge: 72,
      kills: 10,
      deaths: 3,
      assists: 7,
      finalHits: 4,
      damageBlocked: 2500,
      isTeammate: true,
      isUser: true,
    },
    {
      rosterId: 'ally1',
      playerName: 'AllyOne',
      characterName: 'SPIDER-MAN',
      ultCharge: 35,
      kills: 6,
      deaths: 5,
      assists: 4,
      finalHits: 1,
      isTeammate: true,
      isUser: false,
    },
  ]);

  // Sample for swap bar (editable)
  const [sampleSwaps, setSampleSwaps] = useState([
    {
      uid: 'p1',
      name: 'You',
      oldCharacterName: 'IRON MAN',
      newCharacterName: 'CAPTAIN AMERICA',
      oldAvatarURL: null,
      newAvatarURL: null,
      team: 1,
    },
    {
      uid: 'p2',
      name: 'Opponent',
      oldCharacterName: 'VENOM',
      newCharacterName: 'HULK',
      oldAvatarURL: null,
      newAvatarURL: null,
      team: 2,
    },
  ]);
  const [swapShowMatchInfo, setSwapShowMatchInfo] = useState(true);
  const [swapMap, setSwapMap] = useState('Conquest City');
  const [swapGameMode, setSwapGameMode] = useState('Conquest');

  // Sample for match card view player info
  const [isFlipped, setIsFlipped] = useState(false);
  const [samplePlayerCard, setSamplePlayerCard] = useState<PlayerCardData>({
    uid: 'user',
    name: 'You',
    characterName: 'IRON MAN',
    characterId: 'ironman',
    team: 1,
    isLocal: true,
    isTeammate: true,
    kills: 10,
    deaths: 3,
    assists: 7,
    finalHits: 4,
    damageDealt: 23500,
    damageBlocked: 5100,
    totalHeal: 1200,
    killedPlayers: { p2: 2, p3: 1 },
    killedBy: { p4: 1 },
  });

  // Sample for final hits bar
  const [finalHitsPlayers, setFinalHitsPlayers] = useState([
    { uid: 'e1', name: 'Enemy 1', characterName: 'HULK', avatarUrl: null, finalHitsOnPlayer: 2, finalHitsOnYou: 1 },
    { uid: 'e2', name: 'Enemy 2', characterName: 'VENOM', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 3 },
    { uid: 'e3', name: 'Enemy 3', characterName: 'SPIDER-MAN', avatarUrl: null, finalHitsOnPlayer: 1, finalHitsOnYou: 0 },
  ]);

  // Player Status variants — update Redux to reflect variant
  const [playerStatusVariant, setPlayerStatusVariant] = useState<'full' | 'compact' | 'ultra'>('full');
  const applyPlayerStatusVariant = (variant: 'full' | 'compact' | 'ultra') => {
    setPlayerStatusVariant(variant);
    const compact = variant === 'compact';
    const ultra = variant === 'ultra';
    dispatch(updateSettings({
      compactOwnPlayerCard: compact,
      compactTeammate1: compact,
      compactTeammate2: compact,
      compactTeammate3: compact,
      compactTeammate4: compact,
      compactTeammate5: compact,
      ultraCompactOwnPlayerCard: ultra,
      ultraCompactTeammate1: ultra,
      ultraCompactTeammate2: ultra,
      ultraCompactTeammate3: ultra,
      ultraCompactTeammate4: ultra,
      ultraCompactTeammate5: ultra,
    }));
  };

  const middleRender = useMemo(() => {
    switch (active) {
      case 'playerStatus':
        return (
          <TeammateStats players={sampleTeamPlayers} />
        );
      case 'swapBar':
        return (
          <div style={{ background: '#000', padding: 8 }}>
            <SwapBar
              {...({
                characters: sampleSwaps,
                show: true,
                showMatchInfo: swapShowMatchInfo,
                matchInfo: { map: swapMap, gameType: 'PvP', gameMode: swapGameMode },
              } as any)}
            />
          </div>
        );
      case 'playerCard':
        return (
          <div style={{ maxWidth: 360 }}>
            <PlayerCard player={samplePlayerCard} isFlipped={isFlipped} onFlip={() => setIsFlipped((f) => !f)} />
          </div>
        );
      case 'finalHits': {
        const style = { opacity: appSettings.finalHitsOpacity / 100 } as React.CSSProperties;
        const bgStyle = { backgroundColor: appSettings.finalHitsBackgroundColor } as React.CSSProperties;
        return (
          <div style={{ position: 'relative', background: '#000', padding: 8 }}>
            <div className="final-hits-bar-screen" style={style}>
              <div className="final-hits-bar-background" style={bgStyle} />
              <FinalHitsBar players={finalHitsPlayers} />
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  }, [active, sampleTeamPlayers, sampleSwaps, swapShowMatchInfo, swapMap, swapGameMode, samplePlayerCard, isFlipped, finalHitsPlayers]);

  return (
    <div className="dev-playground" style={{ padding: 16, display: 'grid', gridTemplateColumns: '320px 1fr 380px', gap: 16 }}>
      {/* Left controls */}
      <div>
        <h3 style={{ marginBottom: 12, color: '#ffffff' }}>Controls</h3>
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 6 }}>Component</div>
          <Select
            value={active}
            onChange={(val) => setActive(val as PlaygroundComponent)}
            options={[
              { label: 'Player Status', value: 'playerStatus' },
              { label: 'Swap Bar', value: 'swapBar' },
              { label: 'Player Card', value: 'playerCard' },
              { label: 'Final Hits', value: 'finalHits' },
            ]}
            style={{ width: '100%' }}
          />
        </div>

        {active === 'playerStatus' && (
          <>
            <Divider orientation="left" className="section-divider">Player Status Variant</Divider>
            <Segmented
              block
              value={playerStatusVariant}
              onChange={(v) => applyPlayerStatusVariant(v as any)}
              options={[
                { label: 'Full', value: 'full' },
                { label: 'Compact', value: 'compact' },
                { label: 'Ultra', value: 'ultra' },
              ]}
            />
            <Divider orientation="left" className="section-divider">Visibility</Divider>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 10, alignItems: 'center' }}>
              <span>Show Own Card</span>
              <Switch checked={appSettings.showOwnPlayerCard} onChange={(c) => dispatch(updateSettings({ showOwnPlayerCard: c }))} />
              <span>Show Teammate 1</span>
              <Switch checked={appSettings.showTeammate1} onChange={(c) => dispatch(updateSettings({ showTeammate1: c }))} />
            </div>
          </>
        )}

        {active === 'swapBar' && (
          <>
            <Divider orientation="left" className="section-divider">Swap Bar</Divider>
            <Form layout="vertical" style={{ color: '#e6e6e6' }}>
              <Form.Item label="Show Match Info" style={{ marginBottom: 30 }}>
                <Switch checked={swapShowMatchInfo} onChange={setSwapShowMatchInfo} />
              </Form.Item>
              <Form.Item label="Map" style={{ marginBottom: 30 }}>
                <Input value={swapMap} onChange={(e) => setSwapMap(e.target.value)} />
              </Form.Item>
              <Form.Item label="Game Mode">
                <Input value={swapGameMode} onChange={(e) => setSwapGameMode(e.target.value)} />
              </Form.Item>
            </Form>
          </>
        )}

        {active === 'playerCard' && (
          <>
            <Divider orientation="left" className="section-divider">Card Controls</Divider>
            <Button onClick={() => setIsFlipped((f) => !f)} style={{ marginBottom: 30 }}>
              {isFlipped ? 'Show Front' : 'Show Back'}
            </Button>
          </>
        )}

        {active === 'finalHits' && (
          <>
            <Divider orientation="left" className="section-divider">List Controls</Divider>
            <Button onClick={() => setFinalHitsPlayers((list) => [...list, { uid: `e${list.length+1}`, name: `Enemy ${list.length+1}`, characterName: 'HULK', avatarUrl: null, finalHitsOnPlayer: 0, finalHitsOnYou: 0 }])}>Add Opponent</Button>
            <Divider orientation="left" style={{ margin: '12px 0' }}>Appearance</Divider>
            <Form layout="vertical">
              <Form.Item label={`Opacity: ${appSettings.finalHitsOpacity}%`} style={{ marginBottom: 30 }}>
                <Slider min={0} max={100} value={appSettings.finalHitsOpacity} onChange={(v) => dispatch(updateSettings({ finalHitsOpacity: v as number }))} />
              </Form.Item>
              <Form.Item label="Your Hits Color" style={{ marginBottom: 30 }}>
                <ColorPicker
                  value={appSettings.yourFinalHitsColor}
                  onChangeComplete={(c) => dispatch(updateSettings({ yourFinalHitsColor: (c as any).toHexString() }))}
                  showText
                />
              </Form.Item>
              <Form.Item label="Opponent Hits Color" style={{ marginBottom: 30 }}>
                <ColorPicker
                  value={appSettings.opponentFinalHitsColor}
                  onChangeComplete={(c) => dispatch(updateSettings({ opponentFinalHitsColor: (c as any).toHexString() }))}
                  showText
                />
              </Form.Item>
              <Form.Item label="Background Color">
                <ColorPicker
                  value={appSettings.finalHitsBackgroundColor}
                  onChangeComplete={(c) => dispatch(updateSettings({ finalHitsBackgroundColor: (c as any).toHexString() }))}
                  showText
                />
              </Form.Item>
            </Form>
          </>
        )}
      </div>

      {/* Middle rendered component */}
      <div>
        <h3>Preview</h3>
        {middleRender}
      </div>

      {/* Right props editor */}
      <div>
        <h3>Props/Style</h3>

        {active === 'playerStatus' && (
          <Form layout="vertical" style={{ color: '#e6e6e6' }}>
            <Form.Item label={`Opacity: ${appSettings.playerStatsOpacity}%`}>
              <Slider min={0} max={100} value={appSettings.playerStatsOpacity} onChange={(v) => dispatch(updateSettings({ playerStatsOpacity: v as number }))} />
            </Form.Item>
            <Form.Item label="Background Color (hex)" style={{ marginBottom: 30 }}>
              <ColorPicker
                value={appSettings.playerStatsBackgroundColor}
                onChangeComplete={(c) => dispatch(updateSettings({ playerStatsBackgroundColor: (c as any).toHexString() }))}
                showText
              />
            </Form.Item>
            <Form.Item label="Font Color (hex)" style={{ marginBottom: 30 }}>
              <ColorPicker
                value={appSettings.playerStatsFontColor}
                onChangeComplete={(c) => dispatch(updateSettings({ playerStatsFontColor: (c as any).toHexString() }))}
                showText
              />
            </Form.Item>
            <Form.Item label="Teammate Border Color (hex)" style={{ marginBottom: 30 }}>
              <ColorPicker
                value={appSettings.teammateBorderColor}
                onChangeComplete={(c) => dispatch(updateSettings({ teammateBorderColor: (c as any).toHexString() }))}
                showText
              />
            </Form.Item>
          </Form>
        )}

        {active === 'swapBar' && (
          <Form layout="vertical" style={{ color: '#e6e6e6' }}>
            {sampleSwaps.map((s, idx) => (
              <div key={s.uid} style={{ border: '1px solid #333', padding: 8, borderRadius: 6, marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>Swap #{idx + 1}</div>
                <Form.Item label="Name" style={{ marginBottom: 30 }}>
                  <Input value={s.name} onChange={(e) => setSampleSwaps((arr) => arr.map((it, i) => i === idx ? { ...it, name: e.target.value } : it))} />
                </Form.Item>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 30 }}>
                  <Form.Item label="Old Character" style={{ marginBottom: 12 }}>
                    <Select
                      showSearch
                      options={characterOptions}
                      value={s.oldCharacterName}
                      onChange={(v) => setSampleSwaps((arr) => arr.map((it, i) => i === idx ? { ...it, oldCharacterName: v as string } : it))}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                  <Form.Item label="New Character" style={{ marginBottom: 12 }}>
                    <Select
                      showSearch
                      options={characterOptions}
                      value={s.newCharacterName}
                      onChange={(v) => setSampleSwaps((arr) => arr.map((it, i) => i === idx ? { ...it, newCharacterName: v as string } : it))}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
                <Form.Item label="Team" style={{ marginBottom: 30 }}>
                  <Select value={s.team} onChange={(v) => setSampleSwaps((arr) => arr.map((it, i) => i === idx ? { ...it, team: v } : it))} options={[{ value: 1, label: 'Ally' }, { value: 2, label: 'Enemy' }]} />
                </Form.Item>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <Button danger icon={<DeleteOutlined />} onClick={() => setSampleSwaps(arr => arr.filter((_, i) => i !== idx))}>Remove</Button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button icon={<PlusOutlined />} onClick={() => setSampleSwaps(arr => [...arr, { uid: `p${arr.length+1}`, name: 'New', oldCharacterName: 'IRON MAN', newCharacterName: 'HULK', oldAvatarURL: null, newAvatarURL: null, team: 2 }])}>Add Swap</Button>
            </div>
          </Form>
        )}

        {active === 'playerCard' && (
          <Form layout="vertical" style={{ color: '#e6e6e6' }}>
            <Form.Item label="Name" style={{ marginBottom: 30 }}>
              <Input value={samplePlayerCard.name} onChange={(e) => setSamplePlayerCard({ ...samplePlayerCard, name: e.target.value })} />
            </Form.Item>
            <div className="row-2-wide-narrow" style={{ marginBottom: 30 }}>
              <Form.Item label="Character Name" style={{ marginBottom: 0 }}>
                <Select
                  showSearch
                  options={characterOptions}
                  value={samplePlayerCard.characterName}
                  onChange={(v) => setSamplePlayerCard({ ...samplePlayerCard, characterName: v as string })}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item label="Team" style={{ marginBottom: 30 }}>
                <Select value={samplePlayerCard.team} onChange={(v) => setSamplePlayerCard({ ...samplePlayerCard, team: v })} options={[{ value: 1, label: 'Ally' }, { value: 2, label: 'Enemy' }]} />
              </Form.Item>
            </div>
            <div className="row-2" style={{ marginBottom: 30 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center' }}>
                <div>Is Local</div>
                <div style={{ textAlign: 'right' }}>
                  <Switch checked={samplePlayerCard.isLocal} onChange={(v) => setSamplePlayerCard({ ...samplePlayerCard, isLocal: v })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center' }}>
                <div>Is Teammate</div>
                <div style={{ textAlign: 'right' }}>
                  <Switch checked={samplePlayerCard.isTeammate} onChange={(v) => setSamplePlayerCard({ ...samplePlayerCard, isTeammate: v })} />
                </div>
              </div>
            </div>
            <div className="row-2" style={{ marginBottom: 30 }}>
              <Form.Item label="Kills" style={{ marginBottom: 0 }}>
                <InputNumber min={0} value={samplePlayerCard.kills} onChange={(v) => setSamplePlayerCard({ ...samplePlayerCard, kills: Number(v) })} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Deaths" style={{ marginBottom: 0 }}>
                <InputNumber min={0} value={samplePlayerCard.deaths} onChange={(v) => setSamplePlayerCard({ ...samplePlayerCard, deaths: Number(v) })} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Assists" style={{ marginBottom: 0 }}>
                <InputNumber min={0} value={samplePlayerCard.assists} onChange={(v) => setSamplePlayerCard({ ...samplePlayerCard, assists: Number(v) })} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Final Hits" style={{ marginBottom: 0 }}>
                <InputNumber min={0} value={samplePlayerCard.finalHits} onChange={(v) => setSamplePlayerCard({ ...samplePlayerCard, finalHits: Number(v) })} style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </Form>
        )}

        {active === 'finalHits' && (
          <Form layout="vertical" style={{ color: '#e6e6e6' }}>
            {finalHitsPlayers.map((p, idx) => (
              <div key={p.uid} style={{ border: '1px solid #333', padding: 8, borderRadius: 6, marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>Opponent #{idx + 1}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 30 }}>
                  <Form.Item label="Name" style={{ marginBottom: 12 }}>
                    <Input value={p.name} onChange={(e) => setFinalHitsPlayers(arr => arr.map((it, i) => i === idx ? { ...it, name: e.target.value } : it))} />
                  </Form.Item>
                  <Form.Item label="Character Name" style={{ marginBottom: 12 }}>
                    <Select
                      showSearch
                      options={characterOptions}
                      value={p.characterName || undefined}
                      onChange={(v) => setFinalHitsPlayers(arr => arr.map((it, i) => i === idx ? { ...it, characterName: v as string } : it))}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 30 }}>
                  <Form.Item label="Your Hits on Player" style={{ marginBottom: 12 }}>
                    <InputNumber min={0} value={p.finalHitsOnPlayer || 0} onChange={(v) => setFinalHitsPlayers(arr => arr.map((it, i) => i === idx ? { ...it, finalHitsOnPlayer: Number(v) } : it))} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item label="Player's Hits on You" style={{ marginBottom: 12 }}>
                    <InputNumber min={0} value={p.finalHitsOnYou || 0} onChange={(v) => setFinalHitsPlayers(arr => arr.map((it, i) => i === idx ? { ...it, finalHitsOnYou: Number(v) } : it))} style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
                  <Button danger icon={<DeleteOutlined />} onClick={() => setFinalHitsPlayers(arr => arr.filter((_, i) => i !== idx))}>Remove</Button>
                </div>
              </div>
            ))}
          </Form>
        )}

        {active === 'playerStatus' && (
          <Form layout="vertical" style={{ color: '#e6e6e6' }}>
            <Divider orientation="left">Own Player</Divider>
            <Form.Item label="Kills" style={{ marginBottom: 30 }}>
              <InputNumber min={0} value={sampleTeamPlayers[0].kills || 0} onChange={(v) => setSampleTeamPlayers(([me, ally]) => [{ ...me, kills: Number(v) }, ally])} />
            </Form.Item>
            <Form.Item label="Deaths" style={{ marginBottom: 30 }}>
              <InputNumber min={0} value={sampleTeamPlayers[0].deaths || 0} onChange={(v) => setSampleTeamPlayers(([me, ally]) => [{ ...me, deaths: Number(v) }, ally])} />
            </Form.Item>
            <Form.Item label="Assists" style={{ marginBottom: 30 }}>
              <InputNumber min={0} value={sampleTeamPlayers[0].assists || 0} onChange={(v) => setSampleTeamPlayers(([me, ally]) => [{ ...me, assists: Number(v) }, ally])} />
            </Form.Item>
            <Form.Item label="Final Hits" style={{ marginBottom: 30 }}>
              <InputNumber min={0} value={sampleTeamPlayers[0].finalHits || 0} onChange={(v) => setSampleTeamPlayers(([me, ally]) => [{ ...me, finalHits: Number(v) }, ally])} />
            </Form.Item>
            <Form.Item label={`Ult %: ${sampleTeamPlayers[0].ultCharge ?? 0}`} style={{ marginBottom: 30 }}>
              <Slider min={0} max={100} value={sampleTeamPlayers[0].ultCharge || 0} onChange={(v) => setSampleTeamPlayers(([me, ally]) => [{ ...me, ultCharge: Number(v) }, ally])} />
            </Form.Item>
            <Divider orientation="left">Teammate 1</Divider>
            <Form.Item label="Kills" style={{ marginBottom: 30 }}>
              <InputNumber min={0} value={sampleTeamPlayers[1].kills || 0} onChange={(v) => setSampleTeamPlayers(([me, ally]) => [me, { ...ally, kills: Number(v) }])} />
            </Form.Item>
            <Form.Item label="Deaths" style={{ marginBottom: 30 }}>
              <InputNumber min={0} value={sampleTeamPlayers[1].deaths || 0} onChange={(v) => setSampleTeamPlayers(([me, ally]) => [me, { ...ally, deaths: Number(v) }])} />
            </Form.Item>
            <Form.Item label="Assists" style={{ marginBottom: 30 }}>
              <InputNumber min={0} value={sampleTeamPlayers[1].assists || 0} onChange={(v) => setSampleTeamPlayers(([me, ally]) => [me, { ...ally, assists: Number(v) }])} />
            </Form.Item>
            <Form.Item label="Final Hits" style={{ marginBottom: 30 }}>
              <InputNumber min={0} value={sampleTeamPlayers[1].finalHits || 0} onChange={(v) => setSampleTeamPlayers(([me, ally]) => [me, { ...ally, finalHits: Number(v) }])} />
            </Form.Item>
            <Form.Item label={`Ult %: ${sampleTeamPlayers[1].ultCharge ?? 0}`}>
              <Slider min={0} max={100} value={sampleTeamPlayers[1].ultCharge || 0} onChange={(v) => setSampleTeamPlayers(([me, ally]) => [me, { ...ally, ultCharge: Number(v) }])} />
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
};

export default DevPlayground;
