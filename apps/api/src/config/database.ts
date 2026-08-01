import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
    try {
        await mongoose.connect(env.mongodbUri);
        console.log('✅ Connected to MongoDB');

        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

export function getDatabase(): mongoose.Connection {
    return mongoose.connection;
}
