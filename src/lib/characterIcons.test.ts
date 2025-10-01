import { getCharacterIconPath } from './characterIcons';
import { CharacterName } from './characterIcons';

describe('character icon path resolution', () => {
  it('resolves Blade icon path', () => {
    const path = getCharacterIconPath(CharacterName.BLADE);
    console.log('Blade icon path ->', path);
    expect(path).not.toBeNull();
    expect(path).toContain('Blade');
  });

  it('resolves Angela icon path', () => {
    const path = getCharacterIconPath(CharacterName.ANGELA);
    console.log('Angela icon path ->', path);
    expect(path).not.toBeNull();
    expect(path).toContain('Angela');
  });

  it('resolves Ultron icon path', () => {
    const path = getCharacterIconPath(CharacterName.ULTRON);
    console.log('Ultron icon path ->', path);
    expect(path).not.toBeNull();
    expect(path).toContain('Ultron');
  });
});