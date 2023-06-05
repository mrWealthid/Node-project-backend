const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! ✴ Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successfully'));

const PORT = process.env.port || 3000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! ✴ Shutting down...');
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('🔨 SIGTERM RECIEVED');
  server.close(() => 'Process terminated!');
});
