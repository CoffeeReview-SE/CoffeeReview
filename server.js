const express = require('express');
const app = express();

// Khai báo các route, middleware ở đây...
app.get('/', (req, res) => {
  res.send('Server đang hoạt động!');
});

// Đoạn code khởi động server đặt ở cuối file
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
