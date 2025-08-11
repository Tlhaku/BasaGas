const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve marketing website
app.use('/', express.static(path.join(__dirname, 'public/website')));

// Serve web app
app.use('/app', express.static(path.join(__dirname, 'public/app')));

// Example API endpoint for placing orders
app.post('/api/order', (req, res) => {
  const order = req.body;
  // In a real app, you would persist the order in a database
  console.log('Received order', order);
  res.status(201).json({message: 'Order received', order});
});

app.listen(PORT, () => {
  console.log(`BasaGasTemplate server running at http://localhost:${PORT}`);
});
