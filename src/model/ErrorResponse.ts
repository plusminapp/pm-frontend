export type ErrorResponse = {
    errorCode: string;
    message: string;
    parameters?: string[];
    path?: string;
    timestamp?: string;
};
