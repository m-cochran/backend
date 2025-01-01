app.get('/api/get-purchases', async (req, res) => {
  const { email } = req.query;

  const purchases = await Purchase.find({ email }).sort({ date: -1 }).limit(5);
  res.json(purchases);
});
