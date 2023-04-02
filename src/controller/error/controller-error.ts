export abstract class ControllerError extends Error {
	public readonly abstract statusCode: number;
	public readonly abstract error: string;
	public abstract message: string;
}