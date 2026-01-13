import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS setup - applied globally
const allowedOrigins = ['http://localhost:3000', 'http://206.162.244.142:3019'];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // required headers
  }),
);

// Handle preflight requests for all routes
app.options('*', cors());

// Middleware
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
