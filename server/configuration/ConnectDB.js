const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { updateDbConnectionStatus } = require("../middleware/metricsMiddleware");
dotenv.config();

const connectDb = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGODB_URI);
        
        // Add connection options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            autoIndex: true, // Build indexes
            maxPoolSize: 10, // Maintain up to 10 socket connections
            family: 4, // Use IPv4, skip trying IPv6
            retryWrites: true,
            writeConcern: {
                w: 'majority'
            }
        };

        // Connect with options
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "parapharm_ecommerce",
            ...options
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Using database: ${conn.connection.name}`);
        console.log('Current collections:', await conn.connection.db.listCollections().toArray());
        
        // Test the connection
        await mongoose.connection.db.admin().ping();
        console.log("Database ping successful");
        
        // Update metrics: connection successful
        updateDbConnectionStatus(true);

        // List all users in the database
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('Current users in database:', users.map(u => ({ email: u.email, isAdmin: u.isAdmin })));

        // Ensure indexes are created
        await Promise.all([
            mongoose.model('User').ensureIndexes(),
            mongoose.model('Product').ensureIndexes(),
            mongoose.model('Category').ensureIndexes()
        ]);
        console.log("Database indexes ensured");

        // Add connection event listeners
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
            updateDbConnectionStatus(false);
            // Try to reconnect
            setTimeout(() => {
                mongoose.connect(process.env.MONGODB_URI, {
                    dbName: "parapharm_ecommerce",
                    ...options
                }).catch(err => {
                    console.error('Reconnection failed:', err);
                    updateDbConnectionStatus(false);
                });
            }, 5000);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            updateDbConnectionStatus(false);
            // Try to reconnect
            setTimeout(() => {
                mongoose.connect(process.env.MONGODB_URI, {
                    dbName: "parapharm_ecommerce",
                    ...options
                }).catch(err => {
                    console.error('Reconnection failed:', err);
                    updateDbConnectionStatus(false);
                });
            }, 5000);
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
            updateDbConnectionStatus(true);
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        // Update metrics: connection failed
        updateDbConnectionStatus(false);

        // Check for specific error types
        if (error.name === 'MongoServerSelectionError') {
            console.error('Could not connect to any MongoDB servers');
        } else if (error.name === 'MongoNetworkError') {
            console.error('Network error occurred while attempting to connect to MongoDB');
        }

        // Exit with error
        process.exit(1);
    }
};

module.exports = connectDb;