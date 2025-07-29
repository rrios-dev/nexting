import Logger from './logger';
import { RequestLogData } from './logger-types';
import { LogLevel } from './log-levels';

class RequestLogger {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child('REQUEST');
  }

  private extractRequestData(request: Request): RequestLogData {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               undefined;

    return {
      method: request.method,
      url: url.pathname + url.search,
      userAgent,
      ip,
      headers: Object.fromEntries(request.headers.entries()),
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async logRequest(request: Request): Promise<string> {
    const requestId = this.generateRequestId();
    const requestData = this.extractRequestData(request);
    
    await this.logger.info(
      `Incoming ${requestData.method} ${requestData.url}`,
      { requestData },
      requestId,
    );

    return requestId;
  }

  async logResponse(
    requestId: string,
    statusCode: number,
    duration: number,
    additionalData?: Record<string, unknown>,
  ): Promise<void> {
    const message = `Response ${statusCode} (${duration}ms)`;
    const metadata = { statusCode, duration, ...additionalData };
    
    if (statusCode >= 400) {
      await this.logger.warn(message, metadata, requestId);
    } else {
      await this.logger.info(message, metadata, requestId);
    }
  }

  async logError(
    requestId: string,
    error: Error,
    additionalData?: Record<string, unknown>,
  ): Promise<void> {
    await this.logger.error(
      `Request error: ${error.message}`,
      { 
        error: error.name,
        stack: error.stack,
        ...additionalData, 
      },
      requestId,
    );
  }
}

export default RequestLogger; 