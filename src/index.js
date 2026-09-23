require('dotenv').config();
const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const plantingPeriodRoutes = require('./routes/plantingPeriodRoutes');
const stockRoutes = require('./routes/stockRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const expenseCategoryRoutes = require('./routes/expenseCategoryRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { errorResponse } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/planting-periods', plantingPeriodRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/expense-categories', expenseCategoryRoutes);
app.use('/api/expenses', expenseRoutes);

app.use((req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} tidak ditemukan`, 404);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server BUMDes Budidaya Melon berjalan di port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
});
module.exports = app;