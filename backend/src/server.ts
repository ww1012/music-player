import express from 'express';
import cors from 'cors';

import { env, validateEnv } from './config/env';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth';
import favoritesRoutes from './routes/favorites';
import lyricsRoutes from './routes/lyrics';

validateEnv();

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

connectDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/lyrics', lyricsRoutes);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
