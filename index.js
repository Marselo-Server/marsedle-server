const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Ignore CORS (for development purposes only)
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Define user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// Create user model
const User = mongoose.model('User', userSchema);

// Endpoint for GET request (get all users)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Endpoint for POST request (create a user)
app.post('/users', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      username,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Endpoint for PUT request (update a user)
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      // Hash the new password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password
      user.password = hashedPassword;

      // Save the updated user to the database
      await user.save();

      res.json({ message: 'User updated successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Endpoint for DELETE request (delete a user)
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find the user by ID and delete it
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
