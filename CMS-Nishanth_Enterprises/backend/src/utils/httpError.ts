export class HttpError extends Error {
  statusCode: number;
  expose: boolean;

  constructor(statusCode: number, message: string, options?: { expose?: boolean }) {
    super(message);
    this.statusCode = statusCode;
    this.expose = options?.expose ?? true;
  }
}

