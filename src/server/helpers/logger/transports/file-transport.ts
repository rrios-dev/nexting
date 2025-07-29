import { LogTransport, LogEntry } from '../logger-types';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';

interface FileTransportOptions {
  filename: string;
  maxFileSize?: number; // en bytes
  maxFiles?: number;
  autoCreate?: boolean;
}

class FileTransport implements LogTransport {
  private options: Required<FileTransportOptions>;
  private currentSize: number = 0;

  constructor(options: FileTransportOptions) {
    this.options = {
      maxFileSize: options.maxFileSize ?? 10 * 1024 * 1024, // 10MB por defecto
      maxFiles: options.maxFiles ?? 5,
      autoCreate: options.autoCreate ?? true,
      filename: options.filename,
    };
  }

  async log(formattedMessage: string, entry: LogEntry): Promise<void> {
    try {
      if (this.options.autoCreate) {
        await this.ensureDirectory();
      }

      await this.checkRotation();
      await this.writeToFile(formattedMessage);
    } catch (error) {
      // Fallback a console si no se puede escribir al archivo
      console.error('Failed to write to log file:', error);
      console.log(formattedMessage);
    }
  }

  private async ensureDirectory(): Promise<void> {
    const dir = dirname(this.options.filename);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async checkRotation(): Promise<void> {
    try {
      const stats = await fs.stat(this.options.filename);
      this.currentSize = stats.size;

      if (this.currentSize >= this.options.maxFileSize) {
        await this.rotateFiles();
      }
    } catch {
      // Archivo no existe, no necesita rotación
      this.currentSize = 0;
    }
  }

  private async rotateFiles(): Promise<void> {
    // Rotar archivos existentes
    for (let i = this.options.maxFiles - 1; i > 0; i--) {
      const oldFile = `${this.options.filename}.${i}`;
      const newFile = `${this.options.filename}.${i + 1}`;

      try {
        await fs.access(oldFile);
        if (i === this.options.maxFiles - 1) {
          // Eliminar el archivo más antiguo
          await fs.unlink(oldFile);
        } else {
          await fs.rename(oldFile, newFile);
        }
      } catch {
        // Archivo no existe, continuar
      }
    }

    // Rotar el archivo principal
    try {
      await fs.rename(this.options.filename, `${this.options.filename}.1`);
    } catch {
      // Archivo principal no existe
    }

    this.currentSize = 0;
  }

  private async writeToFile(message: string): Promise<void> {
    const logLine = `${message}\n`;
    await fs.appendFile(this.options.filename, logLine, 'utf8');
    this.currentSize += Buffer.byteLength(logLine, 'utf8');
  }
}

export default FileTransport; 