import { HTTPException } from "hono/http-exception";

export const notFound = (message = "Not found") => new HTTPException(404, { message });

export const conflict = (message = "Conflict") => new HTTPException(409, { message });

export const badRequest = (message = "Bad request") => new HTTPException(400, { message });

export const internalError = (message = "Server error") => new HTTPException(500, { message });
