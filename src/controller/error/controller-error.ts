export abstract class ControllerError extends Error {
    public abstract readonly statusCode: number;
    public abstract readonly error: string;
    public abstract message: string;
}
