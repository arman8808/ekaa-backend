const mongoose = require('mongoose')

const connection = () => {
    mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // 10 seconds
      }).then(() => {
        console.log('Connected to MongoDB');
      }).catch(err => {
        console.error('MongoDB connection error:', err.message);
      });
}
module.exports = connection;



