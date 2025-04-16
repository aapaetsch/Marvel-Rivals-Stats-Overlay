import { AppSettings } from './appSettingsSlice';
import { getLocalAppData, writeFileContents } from 'lib/io';

const SETTINGS_FILE_NAME = 'app_settings';

/**
 * Load app settings from Overwolf storage
 * @returns Promise that resolves to the loaded settings or null if there was an error
 */
export const loadAppSettings = async (): Promise<AppSettings | null> => {
  try {
    const path = await getLocalAppData(SETTINGS_FILE_NAME);
    
    return new Promise<AppSettings | null>((resolve) => {
      overwolf.io.readFileContents(
        path,
        'UTF8' as overwolf.io.enums.eEncoding.UTF8,
        (result) => {
          if (result.success && result.content) {
            try {
              const settings = JSON.parse(result.content);
              resolve(settings);
            } catch (e) {
              console.error('Failed to parse settings:', e);
              resolve(null);
            }
          } else {
            console.log('No settings found or failed to read file');
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error loading app settings:', error);
    return null;
  }
};

/**
 * Save app settings to Overwolf storage
 * @param settings The settings to save
 * @returns Promise that resolves to a message indicating success or failure
 */
export const saveAppSettings = async (settings: AppSettings): Promise<string> => {
  try {
    const path = await getLocalAppData(SETTINGS_FILE_NAME);
    return await writeFileContents(path, settings);
  } catch (error) {
    console.error('Error saving app settings:', error);
    return `Error saving settings: ${error}`;
  }
};
