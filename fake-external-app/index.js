const express = require('express');
const app = express();

app.get('/callback', (req, res) => {
  console.log('Auth Code:', req.query.code);
  console.log('State:', req.query.state);
  res.send('Auth successful! Check your console.');
});

app.listen(3000, () => {
  console.log('Test callback server running on port 3000');
});
