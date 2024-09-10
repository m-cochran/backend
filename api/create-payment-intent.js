module.exports = (req, res) => {
  const { amount } = req.body;

  // Example of payment processing logic (replace with real code)
  if (amount) {
    res.json({
      success: true,
      message: 'Payment intent created',
      clientSecret: 'your-client-secret-here'
    });
  } else {
    res.status(400).json({ error: 'Amount is required' });
  }
};
