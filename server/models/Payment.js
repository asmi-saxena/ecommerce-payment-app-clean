const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Payment = sequelize.define('Payment', {
  product_name: {
    type: DataTypes.STRING,
  },
  product_price: {
    type: DataTypes.FLOAT,
  },
  buyer_name: {
    type: DataTypes.STRING,
  },
  buyer_email: {
    type: DataTypes.STRING,
  },
  session_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'payments',
  timestamps: false
});

module.exports = Payment;
