import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

// The original Next.js route handlers all returned
// NextResponse.json({ error: "..." }, { status }) — a flat
// `{ error }` envelope, not Nest's default
// `{ statusCode, message, error }` shape. This filter normalizes
// every thrown HttpException back to that same `{ error }` envelope
// so nothing calling the API (frontend, mobile) has to special-case
// Nest's default error format.
//
// One deliberate, called-out exception: request-body validation
// errors. The original used zod's `error.flatten()`
// ({ fieldErrors, formErrors }); this backend uses class-validator
// via Nest's ValidationPipe, whose messages have a different shape.
// Byte-for-byte parity was only required for *business logic*, not
// the validation library, so this is a known, intentional minor
// contract difference — see MIGRATION_NOTES.md.
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();

    if (status === HttpStatus.BAD_REQUEST && typeof body === "object") {
      // class-validator ValidationPipe error shape
      const message = (body as any).message;
      res.status(status).json({ error: message });
      return;
    }

    const message =
      typeof body === "string"
        ? body
        : (body as any)?.message ?? exception.message;

    res.status(status).json({ error: message });
  }
}
