import { errorLogger } from './error-logger';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function handleAPIError(error: unknown): Promise<Response> {
  if (error instanceof APIError) {
    await errorLogger.logError(error, undefined, error.metadata);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    await errorLogger.logError(error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500 }
    );
  }

  await errorLogger.logError(new Error('Unknown error occurred'));
  return new Response(
    JSON.stringify({ error: 'An unexpected error occurred' }),
    { status: 500 }
  );
} 