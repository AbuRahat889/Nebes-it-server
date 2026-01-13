import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://206.162.244.142:3019',
      'http://206.162.244.142:3019',
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1', router);

// Root
app.get('/', (req, res) => res.send({ message: 'Server running...' }));

// 404 handler
app.use((req, res) =>
  res.status(404).json({ success: false, message: 'API NOT FOUND' }),
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
