require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
require("./auth/google");

const app = express();
const cors = require("cors");

// CORS middleware must be applied before any routes
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// Body parsing middleware (for regular routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const paymentRoute = require("./routes/payment");
app.use("/api/payment", paymentRoute);
app.use(session({
  secret: process.env.COOKIE_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);
const sequelize = require('./models/db');
const Payment = require('./models/Payment');

sequelize.authenticate().then(() => {
  console.log('MySQL Connected');
  // Force sync to update the table with new columns
  return Payment.sync({ force: false, alter: true });
}).then(() => {
  console.log('Payment table synced with new columns');
}).catch(err => {
  console.error('Database Error:', err);
})

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
