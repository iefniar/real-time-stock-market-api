import mongoose from 'mongoose';

export async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(uri);

    mongoose.connection.on('error', (err) =>
      console.error('MongoDB error:', err)
    );

    console.log('Connected to DB');

    return mongoose.connection;
  } catch (err) {
    console.error('Failed to connect to DB:', err);
    return null;
  }
}