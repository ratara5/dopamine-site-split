import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Explicit origin allowlist, NOT a wildcard — required because the
  // session cookie is sent with credentials: "include", and browsers
  // reject `Access-Control-Allow-Origin: *` combined with credentials.
  // CORS_ALLOWED_ORIGINS is a comma-separated list, e.g.:
  //   "https://app.yourdomain.com,http://localhost:3000"
  // Mobile (React Native) requests don't carry a browser Origin header
  // in the way CORS assumes, so this allowlist only ever matters for
  // the web frontend — it has no bearing on the mobile app's access.
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`[backend] listening on port ${port}`);
}

bootstrap();
