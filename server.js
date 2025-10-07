const express = require('express');
const path = require('path');
const connectDB = require('./config/database');
const todoRoutes = require('./routes/todos');
const authRoutes = require('./routes/auth'); // ADD THIS IMPORT

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes); // ADD THIS LINE

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});