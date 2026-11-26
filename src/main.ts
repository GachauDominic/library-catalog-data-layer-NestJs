import "reflect-metadata";
import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

const clientOrigins = (
  process.env.CLIENT_URL ??
  "https://stacks-library-catalog.vercel.app,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

if (clientOrigins.length === 0) {
  throw new Error("CLIENT_URL must contain at least one allowed frontend origin.");
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: clientOrigins,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
  });
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  const url = `http://localhost:${port}`;
  console.log(`Server started and running at ${url}`);
}

void bootstrap();
