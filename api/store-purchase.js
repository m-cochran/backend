app.post('/api/store-purchase', async (req, res) => {
  try {
    const { orderId, email, cartItems, totalAmount, date } = req.body;

    // Validate input data
    if (!orderId || !email || !cartItems || !totalAmount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare data to be inserted into Google Sheets
    const rows = cartItems.map(item => [
      orderId,
      email,
      item.name,
      item.quantity,
      item.price,
      totalAmount,
      date,
    ]);

    // Add data to the Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1', // Change this if your sheet has different range
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });

    // Respond with a success message
    res.status(200).json({ message: 'Purchase stored successfully!' });

  } catch (error) {
    console.error('Error storing purchase:', error);
    res.status(500).json({ error: 'Failed to store purchase. Please try again.' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
