import { RecentPlayersState } from './recentPlayersSlice';
import { getLocalAppData, writeFileContents } from 'lib/io';

const RECENT_PLAYERS_FILE_NAME = 'recent_players_data';

/**
 * Load recent players data from Overwolf storage
 * @returns Promise that resolves to the loaded data or null if there was an error
 */
export const loadRecentPlayersData = async (): Promise<RecentPlayersState | null> => {
  try {
    const path = await getLocalAppData(overwolf, RECENT_PLAYERS_FILE_NAME);
    
    return new Promise<RecentPlayersState | null>((resolve) => {
      overwolf.io.readFileContents(
        path,
        'UTF8' as overwolf.io.enums.eEncoding.UTF8,
        (result) => {
          if (result.success && result.content) {
            try {
              const data = JSON.parse(result.content);
              resolve(data);
            } catch (e) {
              console.error('Failed to parse recent players data:', e);
              resolve(null);
            }
          } else {
            console.log('No recent players data found or failed to read file');
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error loading recent players data:', error);
    return null;
  }
};

/**
 * Save recent players data to Overwolf storage
 * @param data The recent players data to save
 * @returns Promise that resolves to a message indicating success or failure
 */
export const saveRecentPlayersData = async (data: RecentPlayersState): Promise<string> => {
  try {
    const path = await getLocalAppData(overwolf, RECENT_PLAYERS_FILE_NAME);
    return await writeFileContents(path, data);
  } catch (error) {
    console.error('Error saving recent players data:', error);
    return `Error saving recent players data: ${error}`;
  }
};