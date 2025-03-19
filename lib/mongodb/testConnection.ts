import connectToDatabase from './connect';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const mongoose = await connectToDatabase();
    console.log('Connection successful!', mongoose.connection.readyState);
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  }
}

// Run the test
testConnection()
  .then(result => console.log('Test result:', result))
  .catch(err => console.error('Test error:', err));
