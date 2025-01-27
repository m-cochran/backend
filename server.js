const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/save-order', (req, res) => {
  const orderData = req.body;

  // Read the existing orders from orders.json
  fs.readFile('orders.json', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read orders file' });
    }

    let orders = [];
    if (data.length > 0) {
      orders = JSON.parse(data);
    }

    // Add the new order to the orders array
    orders.push(orderData);

    // Write the updated orders array back to orders.json
    fs.writeFile('orders.json', JSON.stringify(orders, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save order' });
      }

      res.status(200).json({ message: 'Order saved successfully' });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
