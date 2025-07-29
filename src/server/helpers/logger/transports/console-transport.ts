import { LogTransport, LogEntry } from '../logger-types';
import { LogLevel } from '../log-levels';

class ConsoleTransport implements LogTransport {
  log(formattedMessage: string, entry: LogEntry): void {
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }
}

export default ConsoleTransport; 