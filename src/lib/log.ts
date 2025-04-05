import { getExtensionPath, writeFileContents } from './io';
import { isDev } from './utils';
import { format } from 'date-fns';

// Directory structure for logs
const LOG_DIR = 'logs';
const INFO_LOG = 'info.log';
const EVENT_LOG = 'events.log';
const MATCH_STATS_LOG = 'match_stats.log';
const ERROR_LOG = 'errors.log';

// Keep track of initialization
let initialized = false;
let logBasePath = '';

/**
 * Initializes the logger by ensuring log directories exist
 */
const init = async (): Promise<void> => {
  if (initialized) return;

  try {
    // Get the extension path
    const extensionPath = await getExtensionPath();
    logBasePath = `${extensionPath}/${LOG_DIR}`;
    
    // Create directories if needed (assumed to happen via overwolf API)
    // For full implementation, we'd need directory creation capabilities
    
    initialized = true;
    log('Logger initialized', 'lib/log.ts', 'init');
  } catch (err) {
    console.error('Failed to initialize logger:', err);
  }
};

/**
 * Generic logging function that writes to console in dev mode
 * and to files in production
 */
const log = (message: string | object, source: string, method: string): void => {
  const timestamp = new Date();
  const formattedTime = format(timestamp, 'yyyy-MM-dd HH:mm:ss.SSS');
  
  // Format the log message
  const formattedMessage = typeof message === 'string' 
    ? message 
    : JSON.stringify(message, null, 2);
  
  const logEntry = {
    timestamp: formattedTime,
    source,
    method,
    message: formattedMessage
  };
  
  // In development mode, always log to console
  if (isDev) {
    console.log(`[${formattedTime}] [${source}:${method}]`, 
      typeof message === 'object' ? message : formattedMessage);
  }
  
  // In production (or if specifically enabled), log to file
  if (!isDev || true) { // Force file logging even in dev mode
    if (initialized && logBasePath) {
      const logPath = `${logBasePath}/${INFO_LOG}`;
      writeFileContents(logPath, logEntry)
        .catch(err => console.error('Failed to write to log file:', err));
    }
  }
};

/**
 * Log specific to match stats - useful for analyzing game data
 */
const logMatchStats = (data: any, source: string, method: string): void => {
  const timestamp = new Date();
  const formattedTime = format(timestamp, 'yyyy-MM-dd HH:mm:ss.SSS');
  
  const logEntry = {
    timestamp: formattedTime,
    source,
    method,
    ...data
  };
  
  // Always log match stats in development
  if (isDev) {
    console.log(`[MATCH STATS] [${formattedTime}] [${source}:${method}]`, data);
  }
  
  // Log to file in both dev and production
  if (initialized && logBasePath) {
    const logPath = `${logBasePath}/${MATCH_STATS_LOG}`;
    writeFileContents(logPath, logEntry)
      .catch(err => console.error('Failed to write match stats to log file:', err));
  }
};

/**
 * Log game events
 */
const logEvents = (data: any, source: string, method: string): void => {
  const timestamp = new Date();
  const formattedTime = format(timestamp, 'yyyy-MM-dd HH:mm:ss.SSS');
  
  const logEntry = {
    timestamp: formattedTime,
    source,
    method,
    ...data
  };
  
  // Always log events in development
  if (isDev) {
    console.log(`[EVENT] [${formattedTime}] [${source}:${method}]`, data);
  }
  
  // Log to file in both dev and production
  if (initialized && logBasePath) {
    const logPath = `${logBasePath}/${EVENT_LOG}`;
    writeFileContents(logPath, logEntry)
      .catch(err => console.error('Failed to write event to log file:', err));
  }
};

/**
 * Log information messages
 */
const logInfo = (data: any, source: string, method: string): void => {
  const timestamp = new Date();
  const formattedTime = format(timestamp, 'yyyy-MM-dd HH:mm:ss.SSS');
  
  const logEntry = {
    timestamp: formattedTime,
    source,
    method,
    ...data
  };
  
  // Always log info in development
  if (isDev) {
    console.log(`[INFO] [${formattedTime}] [${source}:${method}]`, data);
  }
  
  // Log to file in both dev and production
  if (initialized && logBasePath) {
    const logPath = `${logBasePath}/${INFO_LOG}`;
    writeFileContents(logPath, logEntry)
      .catch(err => console.error('Failed to write info to log file:', err));
  }
};

/**
 * Log errors
 */
const logError = (error: Error | string, source: string, method: string): void => {
  const timestamp = new Date();
  const formattedTime = format(timestamp, 'yyyy-MM-dd HH:mm:ss.SSS');
  
  const errorMessage = error instanceof Error ? 
    { name: error.name, message: error.message, stack: error.stack } : 
    error;
  
  const logEntry = {
    timestamp: formattedTime,
    source,
    method,
    error: errorMessage
  };
  
  // Always log errors in development
  console.error(`[ERROR] [${formattedTime}] [${source}:${method}]`, error);
  
  // Log to file in both dev and production
  if (initialized && logBasePath) {
    const logPath = `${logBasePath}/${ERROR_LOG}`;
    writeFileContents(logPath, logEntry)
      .catch(err => console.error('Failed to write error to log file:', err));
  }
};

export const logger = {
  init,
  log,
  logInfo,
  logEvents,
  logMatchStats,
  logError
};

export { log };
