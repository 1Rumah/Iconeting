const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data storage (in-memory with file persistence)
const DATA_FILE = path.join(__dirname, 'data', 'users.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load data from file or initialize
let users = [];
let sessions = {}; // For tracking active sessions

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      users = JSON.parse(data);
      console.log(`Loaded ${users.length} users from file`);
    } else {
      users = [];
      saveData();
    }
  } catch (error) {
    console.error('Error loading data:', error);
    users = [];
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Initialize data
loadData();

// Auto-save every 30 seconds
setInterval(saveData, 30000);

// ============ USER API ============

// Get all users (for admin)
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    users: users.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      balance: u.balance,
      isActive: u.isActive,
      registeredAt: u.registeredAt,
      lastActive: u.lastActive,
      transactions: u.transactions
    }))
  });
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user });
});

// Get user by phone
app.get('/api/users/phone/:phone', (req, res) => {
  const user = users.find(u => u.phone === req.params.phone);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user });
});

// Register new user
app.post('/api/users/register', (req, res) => {
  const { name, phone } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone are required' });
  }
  
  // Check if user already exists
  const existingUser = users.find(u => u.phone === phone);
  if (existingUser) {
    // Update last active
    existingUser.lastActive = Date.now();
    existingUser.name = name; // Update name if changed
    saveData();
    
    return res.json({
      success: true,
      message: 'User logged in',
      user: existingUser,
      isNew: false
    });
  }
  
  // Create new user
  const newUser = {
    id: `USER-${Date.now()}-${uuidv4().substr(0, 8)}`,
    name,
    phone,
    balance: 118101,
    isActive: true,
    registeredAt: Date.now(),
    lastActive: Date.now(),
    transactions: []
  };
  
  users.push(newUser);
  saveData();
  
  res.json({
    success: true,
    message: 'User registered successfully',
    user: newUser,
    isNew: true
  });
});

// Update user balance (add/deduct)
app.post('/api/users/:id/balance', (req, res) => {
  const { amount, description, type, adminName } = req.body;
  const userId = req.params.id;
  
  if (!amount || !description || !type) {
    return res.status(400).json({ success: false, message: 'Amount, description, and type are required' });
  }
  
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  const user = users[userIndex];
  const numAmount = parseInt(amount);
  
  if (type === 'deduct' && user.balance < numAmount) {
    return res.status(400).json({ success: false, message: 'Insufficient balance' });
  }
  
  // Update balance
  if (type === 'add') {
    user.balance += numAmount;
  } else {
    user.balance -= numAmount;
  }
  
  // Add transaction
  const transaction = {
    id: `TRX-${Date.now()}-${uuidv4().substr(0, 5)}`,
    type: type === 'add' ? 'income' : 'expense',
    amount: numAmount,
    description: adminName ? `[ADMIN] ${description}` : description,
    timestamp: Date.now(),
    adminName: adminName || null
  };
  
  user.transactions.unshift(transaction);
  user.lastActive = Date.now();
  
  saveData();
  
  res.json({
    success: true,
    message: `Balance ${type === 'add' ? 'added' : 'deducted'} successfully`,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      balance: user.balance,
      transactions: user.transactions
    }
  });
});

// Toggle user active status
app.patch('/api/users/:id/status', (req, res) => {
  const { isActive } = req.body;
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  users[userIndex].isActive = isActive;
  users[userIndex].lastActive = Date.now();
  saveData();
  
  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'}`,
    user: users[userIndex]
  });
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  saveData();
  
  res.json({
    success: true,
    message: 'User deleted successfully',
    user: deletedUser
  });
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const activeUsers = users.filter(u => u.isActive).length;
  const totalTransactions = users.reduce((sum, u) => sum + u.transactions.length, 0);
  
  res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      activeUsers,
      totalBalance,
      totalTransactions
    }
  });
});

// ============ SESSION API ============

// Create session (login)
app.post('/api/session', (req, res) => {
  const { userId } = req.body;
  const sessionId = uuidv4();
  
  sessions[sessionId] = {
    userId,
    createdAt: Date.now()
  };
  
  res.json({
    success: true,
    sessionId,
    userId
  });
});

// Get session
app.get('/api/session/:id', (req, res) => {
  const session = sessions[req.params.id];
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }
  
  const user = users.find(u => u.id === session.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  res.json({
    success: true,
    session,
    user
  });
});

// Delete session (logout)
app.delete('/api/session/:id', (req, res) => {
  delete sessions[req.params.id];
  res.json({ success: true, message: 'Logged out' });
});

// ============ STATIC FILES ============

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Serve admin.html for /admin route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'admin.html'));
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Main App: http://localhost:${PORT}`);
  console.log(`Admin Panel: http://localhost:${PORT}/admin`);
});
