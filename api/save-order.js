const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// File to save orders
const ordersFile = path.join(__dirname, 'orders.json');

// Save order endpoint
app.post('/api/save-order', (req, res) => {
  const newOrder = req.body;

  // Generate unique order ID
  newOrder.orderId = `ORDER-${Date.now()}`;

  // Read existing orders
  fs.readFile(ordersFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading orders file' });
    }
    const orders = data ? JSON.parse(data) : [];
    orders.push(newOrder);

    // Write updated orders
    fs.writeFile(ordersFile, JSON.stringify(orders, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ error: 'Error saving order' });
      }
      res.json({ success: true, orderId: newOrder.orderId });
    });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
