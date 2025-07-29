import Logger from '../logger';
import { LogLevel } from '../log-levels';
import { LogTransport, LogEntry } from '../logger-types';
import JsonFormatter from '../formatters/json-formatter';

// Mock transport for testing
class MockTransport implements LogTransport {
  public logs: Array<{ message: string; entry: LogEntry }> = [];

  log(formattedMessage: string, entry: LogEntry): void {
    this.logs.push({ message: formattedMessage, entry });
  }

  clear(): void {
    this.logs = [];
  }
}

describe('Logger', () => {
  let mockTransport: MockTransport;
  let logger: Logger;

  beforeEach(() => {
    mockTransport = new MockTransport();
    logger = new Logger({
      level: LogLevel.DEBUG,
      context: 'TEST',
      transports: [mockTransport],
    });
  });

  afterEach(() => {
    mockTransport.clear();
  });

  describe('log levels', () => {
    it('should log messages at or above the configured level', async () => {
      await logger.error('Error message');
      await logger.warn('Warning message');
      await logger.info('Info message');
      await logger.debug('Debug message');
      await logger.trace('Trace message'); // Should not be logged (below DEBUG)

      expect(mockTransport.logs).toHaveLength(4);
      expect(mockTransport.logs[0].entry.level).toBe(LogLevel.ERROR);
      expect(mockTransport.logs[1].entry.level).toBe(LogLevel.WARN);
      expect(mockTransport.logs[2].entry.level).toBe(LogLevel.INFO);
      expect(mockTransport.logs[3].entry.level).toBe(LogLevel.DEBUG);
    });

    it('should respect log level filtering', async () => {
      logger.setLevel(LogLevel.WARN);
      
      await logger.error('Error message');
      await logger.warn('Warning message');
      await logger.info('Info message'); // Should not be logged
      await logger.debug('Debug message'); // Should not be logged

      expect(mockTransport.logs).toHaveLength(2);
    });
  });

  describe('context and metadata', () => {
    it('should include context in log entries', async () => {
      await logger.info('Test message');

      expect(mockTransport.logs[0].entry.context).toBe('TEST');
    });

    it('should include metadata when provided', async () => {
      const metadata = { userId: '123', action: 'login' };
      await logger.info('User action', metadata);

      expect(mockTransport.logs[0].entry.metadata).toEqual(metadata);
    });

    it('should include requestId when provided', async () => {
      const requestId = 'req_123';
      await logger.info('Request processed', undefined, requestId);

      expect(mockTransport.logs[0].entry.requestId).toBe(requestId);
    });
  });

  describe('child loggers', () => {
    it('should create child logger with extended context', async () => {
      const childLogger = logger.child('CHILD');
      childLogger.addTransport(mockTransport);
      
      await childLogger.info('Child message');

      expect(mockTransport.logs[0].entry.context).toBe('TEST:CHILD');
    });
  });

  describe('formatters', () => {
    it('should use JSON formatter correctly', async () => {
      logger.setFormatter(new JsonFormatter());
      
      await logger.info('Test message', { key: 'value' });

      const loggedMessage = mockTransport.logs[0].message;
      const parsedLog = JSON.parse(loggedMessage);
      
      expect(parsedLog.level).toBe('INFO');
      expect(parsedLog.message).toBe('Test message');
      expect(parsedLog.metadata.key).toBe('value');
      expect(parsedLog.context).toBe('TEST');
    });
  });
}); 