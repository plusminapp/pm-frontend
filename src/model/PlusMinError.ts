export interface PlusMinErrorResponse {
  errorCode: string;
  message: string;
  parameters: string[];
  path?: string;
  timestamp: string;
}

// Extend Error interface
declare global {
  interface Error {
    status?: number;
    body?: string;
    plusMinError?: PlusMinErrorResponse;
  }
}