import RequestLogger from '../request-logger';
import Logger from '../logger';
import { LogTransport, LogEntry } from '../logger-types';
import { LogLevel } from '../log-levels';

class MockTransport implements LogTransport {
  public logs: Array<{ message: string; entry: LogEntry }> = [];

  log(formattedMessage: string, entry: LogEntry): void {
    this.logs.push({ message: formattedMessage, entry });
  }

  clear(): void {
    this.logs = [];
  }
}

describe('RequestLogger', () => {
  let mockTransport: MockTransport;
  let logger: Logger;
  let requestLogger: RequestLogger;

  beforeEach(() => {
    mockTransport = new MockTransport();
    logger = new Logger({
      level: LogLevel.DEBUG,
      context: 'TEST',
      transports: [mockTransport],
    });
    requestLogger = new RequestLogger(logger);
  });

  afterEach(() => {
    mockTransport.clear();
  });

  describe('logRequest', () => {
    it('should log incoming request and return requestId', async () => {
      const request = new Request('https://example.com/api/users?page=1', {
        method: 'GET',
        headers: {
          'user-agent': 'Mozilla/5.0',
          'x-forwarded-for': '192.168.1.1',
        },
      });

      const requestId = await requestLogger.logRequest(request);

      expect(requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(mockTransport.logs).toHaveLength(1);
      
      const logEntry = mockTransport.logs[0].entry;
      expect(logEntry.level).toBe(LogLevel.INFO);
      expect(logEntry.message).toBe('Incoming GET /api/users?page=1');
      expect(logEntry.context).toBe('TEST:REQUEST');
      expect(logEntry.requestId).toBe(requestId);
      expect(logEntry.metadata?.requestData).toEqual({
        method: 'GET',
        url: '/api/users?page=1',
        userAgent: 'Mozilla/5.0',
        ip: '192.168.1.1',
        headers: expect.any(Object),
      });
    });
  });

  describe('logResponse', () => {
    it('should log successful response with INFO level', async () => {
      const requestId = 'test-request-id';
      
      await requestLogger.logResponse(requestId, 200, 150, { 
        responseSize: '1.2KB' 
      });

      expect(mockTransport.logs).toHaveLength(1);
      
      const logEntry = mockTransport.logs[0].entry;
      expect(logEntry.level).toBe(LogLevel.INFO);
      expect(logEntry.message).toBe('Response 200 (150ms)');
      expect(logEntry.requestId).toBe(requestId);
      expect(logEntry.metadata).toEqual({
        statusCode: 200,
        duration: 150,
        responseSize: '1.2KB',
      });
    });

    it('should log error response with WARN level', async () => {
      const requestId = 'test-request-id';
      
      await requestLogger.logResponse(requestId, 404, 50);

      expect(mockTransport.logs).toHaveLength(1);
      
      const logEntry = mockTransport.logs[0].entry;
      expect(logEntry.level).toBe(LogLevel.WARN);
      expect(logEntry.message).toBe('Response 404 (50ms)');
    });
  });

  describe('logError', () => {
    it('should log request error with ERROR level', async () => {
      const requestId = 'test-request-id';
      const error = new Error('Database connection failed');
      
      await requestLogger.logError(requestId, error, { 
        endpoint: '/api/users' 
      });

      expect(mockTransport.logs).toHaveLength(1);
      
      const logEntry = mockTransport.logs[0].entry;
      expect(logEntry.level).toBe(LogLevel.ERROR);
      expect(logEntry.message).toBe('Request error: Database connection failed');
      expect(logEntry.requestId).toBe(requestId);
      expect(logEntry.metadata).toEqual({
        error: 'Error',
        stack: expect.any(String),
        endpoint: '/api/users',
      });
    });
  });
}); 