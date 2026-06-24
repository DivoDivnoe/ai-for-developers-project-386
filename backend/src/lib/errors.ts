import { HTTPException } from 'hono/http-exception';

export const notFound = (message = 'Not found') => new HTTPException(404, { message });

export const conflict = (message = 'Conflict') => new HTTPException(409, { message });
