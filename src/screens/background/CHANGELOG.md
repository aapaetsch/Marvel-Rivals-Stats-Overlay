# Changelog
All notable changes to the background will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- ELO Tracking Integration (matchStatsSlice.ts): Integrated ELO tracking into roster update processing to automatically record local player's ELO score at match start [ELO Tracking System]. System captures elo_score from roster events, records it with game mode and match ID, and prevents duplicate recordings per match. See also root CHANGELOG.md and lib/CHANGELOG.md.
- Character Session Tracking: Implemented in-match character session tracker in `matchStatsSlice.ts` that maintains per-player state including current character, session start time, and session start KDA. On each roster event, the system compares character names and calculates time-delta and KDA-delta when characters change.
- Character History Storage: Added `characterHistory` array to `RecentPlayer` interface in `recentPlayersSlice.ts` storing detailed per-character session data including `characterName`, `timeSpentMs`, `kills`, `deaths`, `assists`, `timestamp`, `isAlly`, and `matchId`.
- Match Completion Aggregation: Updated `matchCompletionMiddleware.ts` in `store.ts` to aggregate character sessions at match_end, extracting each player's session array, summing time/KDA per character, and merging with existing recent player character history (keeping last 50 entries per player).
- Session Edge-Case Handling: Added logic to handle empty `character_name` in early roster events (waits until non-empty to start tracking) and finalize the last character session when match_end fires using final roster snapshot timestamp.

### Changed
- Recent Player Data Structure: Enhanced `addRecentPlayersFromMatch` reducer to merge incoming character history entries, sort by timestamp descending, and trim to maximum length while maintaining backwards compatibility with legacy `charactersAsAlly/AsOpponent` arrays.