import { 
  createLogger, 
  createRequestLogger, 
  LogLevel,
  JsonFormatter,
  SimpleFormatter,
  ConsoleTransport,
} from '../index';

// Ejemplo 1: Logger básico
const basicLogger = createLogger({
  level: LogLevel.DEBUG,
  context: 'API',
});

async function basicUsage() {
  await basicLogger.info('Server started');
  await basicLogger.error('Database connection failed', { 
    database: 'primary',
    retries: 3 
  });
}

// Ejemplo 2: Logger con formato JSON para producción
const productionLogger = createLogger({
  level: LogLevel.INFO,
  context: 'PROD',
  formatter: new JsonFormatter(),
});

async function productionUsage() {
  await productionLogger.warn('High memory usage detected', {
    memoryUsage: '85%',
    threshold: '80%',
    pid: process.pid,
  });
}

// Ejemplo 3: Logger hijo con contexto específico
const authLogger = basicLogger.child('AUTH');

async function authUsage() {
  await authLogger.info('User login attempt', { userId: '123', ip: '192.168.1.1' });
  await authLogger.error('Invalid credentials', { userId: '123' });
}

// Ejemplo 4: Request Logger para APIs
const requestLogger = createRequestLogger();

async function apiUsage(request: Request) {
  // Log request entrante
  const requestId = await requestLogger.logRequest(request);
  
  try {
    // Simular procesamiento
    const startTime = Date.now();
    
    // ... lógica de tu API ...
    
    const duration = Date.now() - startTime;
    
    // Log respuesta exitosa
    await requestLogger.logResponse(requestId, 200, duration, {
      responseSize: '1.2KB'
    });
  } catch (error) {
    // Log error
    await requestLogger.logError(requestId, error as Error, {
      endpoint: '/api/users'
    });
  }
}

// Ejemplo 5: Logger personalizado con múltiples transportes
const customLogger = createLogger({
  level: LogLevel.TRACE,
  context: 'CUSTOM',
  formatter: new SimpleFormatter(),
  transports: [new ConsoleTransport()],
});

async function customUsage() {
  await customLogger.trace('Detailed debug information');
  await customLogger.debug('Debug message');
  await customLogger.info('Information message');
  await customLogger.warn('Warning message');
  await customLogger.error('Error message');
}

export {
  basicUsage,
  productionUsage,
  authUsage,
  apiUsage,
  customUsage,
}; 