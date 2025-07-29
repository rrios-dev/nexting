import { LogLevel } from './log-levels';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  context?: string;
  requestId?: string;
}

export interface LogFormatter {
  format(entry: LogEntry): string;
}

export interface LogTransport {
  log(formattedMessage: string, entry: LogEntry): void | Promise<void>;
}

export interface LoggerConfig {
  level: LogLevel;
  context?: string;
  formatter?: LogFormatter;
  transports?: LogTransport[];
  includeTimestamp?: boolean;
  includeContext?: boolean;
  includeMetadata?: boolean;
}

export interface RequestLogData {
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  headers?: Record<string, string>;
  body?: unknown;
  duration?: number;
  statusCode?: number;
}

export default LogEntry; 