import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';

import { errorHandlerMiddleware } from './middleware.js';
import routes from './routes/index.js';
import type { Server } from 'http';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use(routes)

app.use(errorHandlerMiddleware);

let server: Server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

export { app, server };