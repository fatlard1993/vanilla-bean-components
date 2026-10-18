/** A request asked for something malformed: a body of the wrong shape, a field of the wrong type. `withErrors` answers 400. */
export class ValidationError extends Error {
	status = 400;
}

/**
 * An update was made against an older version than the one stored. `withErrors` answers 409 with the stored record, so
 * the client can show what changed rather than overwrite it.
 */
export class ConflictError extends Error {
	status = 409;

	constructor(current) {
		super('This was changed since it was loaded');
		this.current = current;
	}
}
