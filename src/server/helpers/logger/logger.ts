import { LogLevel, LOG_LEVEL_PRIORITY } from './log-levels';
import { LoggerConfig, LogEntry, LogFormatter, LogTransport } from './logger-types';
import ConsoleTransport from './transports/console-transport';
import PrettyFormatter from './formatters/pretty-formatter';

class Logger {
  private config: Required<LoggerConfig>;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level ?? LogLevel.INFO,
      context: config.context ?? 'APP',
      formatter: config.formatter ?? new PrettyFormatter(),
      transports: config.transports ?? [new ConsoleTransport()],
      includeTimestamp: config.includeTimestamp ?? true,
      includeContext: config.includeContext ?? true,
      includeMetadata: config.includeMetadata ?? true,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[this.config.level];
  }

  private async writeLog(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    requestId?: string,
  ): Promise<void> {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      ...(this.config.includeContext && { context: this.config.context }),
      ...(this.config.includeMetadata && metadata && { metadata }),
      ...(requestId && { requestId }),
    };

    const formattedMessage = this.config.formatter.format(entry);

    const logPromises = this.config.transports.map((transport) =>
      Promise.resolve(transport.log(formattedMessage, entry)),
    );

    await Promise.all(logPromises);
  }

  error(message: string, metadata?: Record<string, unknown>, requestId?: string): Promise<void> {
    return this.writeLog(LogLevel.ERROR, message, metadata, requestId);
  }

  warn(message: string, metadata?: Record<string, unknown>, requestId?: string): Promise<void> {
    return this.writeLog(LogLevel.WARN, message, metadata, requestId);
  }

  info(message: string, metadata?: Record<string, unknown>, requestId?: string): Promise<void> {
    return this.writeLog(LogLevel.INFO, message, metadata, requestId);
  }

  debug(message: string, metadata?: Record<string, unknown>, requestId?: string): Promise<void> {
    return this.writeLog(LogLevel.DEBUG, message, metadata, requestId);
  }

  trace(message: string, metadata?: Record<string, unknown>, requestId?: string): Promise<void> {
    return this.writeLog(LogLevel.TRACE, message, metadata, requestId);
  }

  child(context: string): Logger {
    return new Logger({
      ...this.config,
      context: `${this.config.context}:${context}`,
    });
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  setFormatter(formatter: LogFormatter): void {
    this.config.formatter = formatter;
  }

  addTransport(transport: LogTransport): void {
    this.config.transports.push(transport);
  }
}

export default Logger; 