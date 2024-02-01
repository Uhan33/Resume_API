import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRouter from './routes/users.router.js';
import ResumesRouter from './routes/resumes.router.js';
import logMiddleware from './middlewares/log.middleware.js';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import { swaggerUi, specs } from './routes/swagger.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api', [UsersRouter, ResumesRouter]);

app.use(errorHandlingMiddleware);
app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
