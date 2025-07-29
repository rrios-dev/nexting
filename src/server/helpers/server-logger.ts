import Logger from './logger/logger';
import RequestLogger from './logger/request-logger';
import { LogLevel } from './logger/log-levels';
import { LoggerConfig } from './logger/logger-types';

// Instancia por defecto para desarrollo
const defaultLogger = new Logger({
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  context: 'SERVER',
});

// Request logger para APIs
const requestLogger = new RequestLogger(defaultLogger);

// Función principal para compatibilidad hacia atrás
const serverLogger = async (request: Request): Promise<string> => {
  return await requestLogger.logRequest(request);
};

// Exportar factory para crear loggers personalizados
const createLogger = (config?: Partial<LoggerConfig>): Logger => {
  return new Logger(config);
};

// Exportar request logger para uso avanzado
const createRequestLogger = (logger?: Logger): RequestLogger => {
  return new RequestLogger(logger || defaultLogger);
};

// Exportaciones adicionales
export {
  Logger,
  RequestLogger,
  LogLevel,
  createLogger,
  createRequestLogger,
  defaultLogger,
  requestLogger,
};

export default serverLogger;