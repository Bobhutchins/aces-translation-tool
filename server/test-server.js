const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'ACES Translation Tool Test Server' });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
