/**
 * Sistema de logging estructurado para la aplicación
 * Reemplaza console.log con un sistema más robusto y configurable
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: unknown;
  context?: string;
  error?: Error;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? `[${context}]` : '';
    return `${timestamp} ${levelName}${contextStr}: ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: string, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);

    // En desarrollo, usar console con colores
    if (this.isDevelopment) {
      const icon = {
        [LogLevel.DEBUG]: '🐛',
        [LogLevel.INFO]: 'ℹ️',
        [LogLevel.WARN]: '⚠️',
        [LogLevel.ERROR]: '❌'
      };

      console.group(`${icon[level]} ${formattedMessage}`);
      if (data) console.log('Data:', data);
      if (error) console.error('Error:', error);
      console.groupEnd();
    } else {
      // En producción, solo logear errores y warnings
      if (level >= LogLevel.WARN) {
        console.warn(formattedMessage);
        if (error) console.error(error);
      }
    }

    // Aquí se podría enviar a un servicio de logging externo
    // this.sendToExternalService(logEntry);
  }

  debug(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  info(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  warn(message: string, data?: unknown, context?: string, error?: Error): void {
    this.log(LogLevel.WARN, message, data, context, error);
  }

  error(message: string, error?: Error, data?: unknown, context?: string): void {
    this.log(LogLevel.ERROR, message, data, context, error);
  }

  // Métodos específicos para diferentes contextos
  api(message: string, data?: unknown): void {
    this.info(message, data, 'API');
  }

  auth(message: string, data?: unknown): void {
    this.info(message, data, 'AUTH');
  }

  sync(message: string, data?: unknown): void {
    this.info(message, data, 'SYNC');
  }

  ui(message: string, data?: unknown): void {
    this.debug(message, data, 'UI');
  }

  performance(message: string, data?: unknown): void {
    this.debug(message, data, 'PERF');
  }

  // Método para cambiar el nivel de logging dinámicamente
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  // Método para obtener el nivel actual
  getLevel(): LogLevel {
    return this.level;
  }
}

// Instancia global del logger
export const logger = new Logger();

// Exportar métodos individuales para uso directo
export const { debug, info, warn, error, api, auth, sync, ui, performance } = logger;