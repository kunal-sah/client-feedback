import { toast } from '@/components/ui/use-toast';

interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  path?: string;
  userId?: string;
  metadata?: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private async sendToServer(errorLog: ErrorLog): Promise<void> {
    try {
      const response = await fetch('/api/log/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });

      if (!response.ok) {
        console.error('Failed to send error log to server:', await response.text());
      }
    } catch (error) {
      console.error('Error sending log to server:', error);
    }
  }

  public async logError(
    error: Error,
    componentStack?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      componentStack,
      timestamp: new Date().toISOString(),
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    };

    if (this.isDevelopment) {
      console.error('Error logged:', errorLog);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }

    await this.sendToServer(errorLog);
  }
}

export const errorLogger = ErrorLogger.getInstance(); 