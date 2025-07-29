import { LogFormatter, LogEntry } from '../logger-types';

class SimpleFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    let message = `${timestamp} [${entry.level}]`;
    
    if (entry.context) {
      message += ` [${entry.context}]`;
    }
    
    message += ` ${entry.message}`;
    
    return message;
  }
}

export default SimpleFormatter; 