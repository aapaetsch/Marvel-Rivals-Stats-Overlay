import { MatchStatsState } from 'screens/background/types/matchStatsTypes';
import ForceShowCover from '../features/appSettings/forceShowCover';

/**
 * Determines if a match is currently live (in progress)
 * A match is considered live if it has started but not ended
 */
export const isMatchLive = (currentMatch: MatchStatsState): boolean => {
  return currentMatch.timestamps.matchStart !== null && currentMatch.timestamps.matchEnd === null;
};

/**
 * Determines if the card view should show a cover (no live match)
 * Cover should be shown when:
 * 1. No match is live (either no match started or match has ended)
 * 2. Force cover is enabled (dev override)
 */
export const shouldShowCardViewCover = (
  currentMatch: MatchStatsState,
  forceShowCover: ForceShowCover = ForceShowCover.Auto
): boolean => {
  // Tri-state override:
  // - 'show' => always show cover
  // - 'hide' => always hide cover
  // - 'auto' => show when not live
  if (forceShowCover === ForceShowCover.Show) return true;
  if (forceShowCover === ForceShowCover.Hide) return false;
  return !isMatchLive(currentMatch);
};

/**
 * Determines if there's any match data available at all
 * This helps distinguish between "no match ever" vs "match ended"
 */
export const hasAnyMatchData = (currentMatch: MatchStatsState): boolean => {
  return currentMatch.matchId !== null || Object.keys(currentMatch.players).length > 0;
};