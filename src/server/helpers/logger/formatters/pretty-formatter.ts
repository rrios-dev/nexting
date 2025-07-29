import { LogFormatter, LogEntry } from '../logger-types';
import { LOG_LEVEL_COLORS, RESET_COLOR } from '../log-levels';

class PrettyFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const color = LOG_LEVEL_COLORS[entry.level];
    const levelText = `[${entry.level}]`.padEnd(7);
    
    let message = `${color}${timestamp} ${levelText}${RESET_COLOR}`;
    
    if (entry.context) {
      message += ` [${entry.context}]`;
    }
    
    if (entry.requestId) {
      message += ` [${entry.requestId}]`;
    }
    
    message += ` ${entry.message}`;
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      message += `\n  Metadata: ${JSON.stringify(entry.metadata, null, 2)}`;
    }
    
    return message;
  }
}

export default PrettyFormatter; 