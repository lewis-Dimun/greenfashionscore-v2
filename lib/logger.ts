type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  surveyId?: string;
  [key: string]: any;
}

export const logger = {
  log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };
    
    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry, LogRocket, etc.
      console[level](JSON.stringify(logEntry));
    } else {
      console[level](`[${level.toUpperCase()}] ${message}`, context || '');
    }
  },
  
  info: (msg: string, ctx?: LogContext) => logger.log('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => logger.log('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => logger.log('error', msg, ctx),
};

