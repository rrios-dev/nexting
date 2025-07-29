import { LogFormatter, LogEntry } from '../logger-types';

class JsonFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const logObject = {
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.requestId && { requestId: entry.requestId }),
      ...(entry.metadata && { metadata: entry.metadata }),
    };

    return JSON.stringify(logObject);
  }
}

export default JsonFormatter; 