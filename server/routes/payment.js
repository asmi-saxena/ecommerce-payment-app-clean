const express = require("express");
const Stripe = require("stripe");
const router = express.Router();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { sendPaymentNotification } = require("../utils/emailService");
const Payment = require('../models/Payment');

// This route will fetch all payment records
router.get("/list", async (req, res) => {
  try {
    const records = await Payment.findAll({
      order: [["created_at", "DESC"]],
    });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Simple test endpoint
router.get("/test", (req, res) => {
  console.log('Simple test endpoint called');
  res.json({ message: "Test endpoint working!" });
});

// Debug endpoint to check all payments in database
router.get("/debug-payments", async (req, res) => {
  try {
    console.log('Debug: Checking all payments in database...');
    const payments = await Payment.findAll({
      order: [['created_at', 'DESC']]
    });
    
    console.log(`Found ${payments.length} payments in database`);
    payments.forEach(payment => {
      console.log(`ID: ${payment.id} | ${payment.buyer_name} | ${payment.buyer_email} | ₹${payment.product_price} | Session: ${payment.session_id || 'N/A'} | ${payment.created_at}`);
    });
    
    res.json({ 
      message: `Found ${payments.length} payments`,
      payments: payments.map(p => ({
        id: p.id,
        buyer_name: p.buyer_name,
        buyer_email: p.buyer_email,
        product_price: p.product_price,
        session_id: p.session_id,
        created_at: p.created_at
      }))
    });
  } catch (err) {
    console.error('Error in debug endpoint:', err);
    res.status(500).json({ error: "Failed to get payments", details: err.message });
  }
});

// Fix database structure endpoint
router.post("/fix-database", async (req, res) => {
  try {
    console.log('Fixing database structure...');
    
    // Add session_id column if it doesn't exist
    try {
      await sequelize.query('ALTER TABLE payments ADD COLUMN session_id VARCHAR(255) UNIQUE');
      console.log('Added session_id column');
    } catch (err) {
      if (err.message.includes('Duplicate column name')) {
        console.log('session_id column already exists');
      } else {
        throw err;
      }
    }
    
    // Update existing records with unique session IDs
    const payments = await Payment.findAll({
      where: {
        session_id: null
      }
    });
    
    for (let payment of payments) {
      await payment.update({
        session_id: `legacy_${payment.id}_${Date.now()}`
      });
    }
    
    console.log(`Updated ${payments.length} legacy payments with session IDs`);
    
    res.json({ 
      message: "Database structure fixed",
      updatedPayments: payments.length
    });
      } catch (err) {
      console.error('Error fixing database:', err);
      res.status(500).json({ error: "Failed to fix database", details: err.message });
    }
});

// Test endpoint to manually add a payment record
router.post("/test-add", async (req, res) => {
  try {
    console.log('Test endpoint called');
    const paymentRecord = await Payment.create({
      product_name: 'Test Product',
      product_price: 100,
      buyer_name: 'Test User',
      buyer_email: 'test@example.com'
    });
    
    console.log('Test payment record created:', paymentRecord.toJSON());
    res.json({ message: "Test payment added", record: paymentRecord });
  } catch (err) {
    console.error('Error in test endpoint:', err);
    res.status(500).json({ error: "Failed to add test payment", details: err.message });
  }
});

// Test email endpoint
router.post("/test-email", async (req, res) => {
  try {
    console.log('Testing email functionality...');
    console.log('Environment variables:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? 'Set' : 'Not set');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !process.env.ADMIN_EMAIL) {
      return res.status(400).json({ 
        error: "Email configuration missing",
        details: "Please check EMAIL_USER, EMAIL_PASSWORD, and ADMIN_EMAIL in your .env file"
      });
    }
    
    // Create a test payment record
    const testPayment = {
      id: 'test_' + Date.now(),
      buyer_name: 'Test Customer',
      buyer_email: 'test@example.com',
      product_name: 'Test Product',
      product_price: 500,
      created_at: new Date()
    };
    
    // Try to send email
    await sendPaymentNotification(testPayment);
    
    res.json({ 
      message: "Test email sent successfully",
      testPayment: testPayment
    });
    
  } catch (err) {
    console.error('Error in test email endpoint:', err);
    res.status(500).json({ 
      error: "Failed to send test email", 
      details: err.message,
      stack: err.stack
    });
  }
});

// Manual trigger email endpoint (for testing)
router.post("/trigger-email", async (req, res) => {
  try {
    console.log('Manual email trigger called');
    
    // Create a test payment record similar to what would be created during payment
    const testPayment = {
      id: 'manual_' + Date.now(),
      buyer_name: 'Manual Test User',
      buyer_email: 'manual@test.com',
      product_name: 'Asmi Premium Plan',
      product_price: 999,
      created_at: new Date()
    };
    
    console.log('Sending manual test email with payment:', testPayment);
    await sendPaymentNotification(testPayment);
    
    res.json({ 
      message: "Manual test email sent successfully",
      payment: testPayment
    });
    
  } catch (err) {
    console.error('Error in manual email trigger:', err);
    res.status(500).json({ 
      error: "Failed to send manual test email", 
      details: err.message
    });
  }
});

// Cleanup endpoint to remove duplicate payments (very recent duplicates)
router.post("/cleanup-duplicates", async (req, res) => {
  try {
    console.log('Cleaning up very recent duplicate payments...');
    
    // Get all payments from the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const payments = await Payment.findAll({
      where: {
        created_at: {
          [sequelize.Op.gte]: fiveMinutesAgo
        }
      },
      order: [['created_at', 'ASC']]
    });
    
    console.log(`Found ${payments.length} recent payments`);
    
    const seen = new Set();
    const toDelete = [];
    
    payments.forEach(payment => {
      // Create a key based on user, product, and time (within 30 seconds)
      const paymentTime = new Date(payment.created_at).getTime();
      const key = `${payment.buyer_email}-${payment.product_name}-${payment.product_price}-${Math.floor(paymentTime / 30000)}`; // 30 second window
      
      if (seen.has(key)) {
        toDelete.push(payment.id);
        console.log(`Marking duplicate for deletion: ID ${payment.id} - Key: ${key}`);
      } else {
        seen.add(key);
        console.log(`Keeping payment: ID ${payment.id} - Key: ${key}`);
      }
    });
    
    if (toDelete.length > 0) {
      await Payment.destroy({
        where: {
          id: toDelete
        }
      });
      console.log(`Deleted ${toDelete.length} duplicate payments`);
      res.json({ message: `Cleaned up ${toDelete.length} duplicate payments`, deletedIds: toDelete });
    } else {
      res.json({ message: "No duplicates found" });
    }
  } catch (err) {
    console.error('Error cleaning up duplicates:', err);
    res.status(500).json({ error: "Failed to cleanup duplicates", details: err.message });
  }
});



router.post("/payment-success", async (req, res) => {
  console.log('Payment success endpoint called');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  const { user, product, sessionId } = req.body;
  
  console.log('Extracted data:');
  console.log('User:', user);
  console.log('Product:', product);
  console.log('Session ID:', sessionId);

  try {
    console.log('Creating payment record directly...');
    
    // Check if payment already exists for this session or recent duplicate
    if (sessionId) {
      const existingPayment = await Payment.findOne({
        where: {
          session_id: sessionId
        }
      });

      if (existingPayment) {
        console.log('Payment already exists for session:', sessionId, 'skipping duplicate');
        return res.status(200).json({ message: "Payment already recorded" });
      }
    }

    // Check for very recent duplicate payments (same user, same product, within last 30 seconds)
    const recentPayment = await Payment.findOne({
      where: {
        buyer_email: user.email,
        product_name: product.name,
        product_price: product.price
      },
      order: [['created_at', 'DESC']]
    });

    if (recentPayment) {
      const timeDiff = Date.now() - new Date(recentPayment.created_at).getTime();
      if (timeDiff < 30 * 1000) { // 30 seconds
        console.log('Very recent payment exists, skipping duplicate:', recentPayment.id);
        return res.status(200).json({ message: "Payment already recorded recently" });
      }
    }

    // Create the payment record directly
    const paymentRecord = await Payment.create({
      product_name: product.name,
      product_price: product.price,
      buyer_name: user.name,
      buyer_email: user.email,
      session_id: sessionId || `manual_${Date.now()}`
    });
    
    console.log('Payment stored in database with ID:', paymentRecord.id);
    console.log('Payment details:', {
      name: user.name,
      email: user.email,
      product: product.name,
      price: product.price
    });

    console.log('About to send email notification');
    console.log('sendPaymentNotification function exists:', typeof sendPaymentNotification);
    
    // Send email notification to super admin
    console.log('Attempting to send email notification');
    try {
      console.log('Calling sendPaymentNotification with:', paymentRecord.toJSON());
      await sendPaymentNotification(paymentRecord);
      console.log('Email notification sent to super admin successfully');
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      console.error('Email error details:', emailError.message);
      console.error('Email error stack:', emailError.stack);
      // Don't fail the payment if email fails
    }

    res.status(200).json({ 
      message: "Payment stored successfully",
      paymentId: paymentRecord.id
    });
      } catch (err) {
      console.error('Error storing payment:', err);
      res.status(500).json({ error: "Failed to store payment", details: err.message });
    }
});

router.post("/create-checkout-session", async (req, res) => {
  try {
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request body type:', typeof req.body);
    
    if (!req.body) {
      console.error('req.body is undefined or null');
      return res.status(400).json({ error: "Request body is missing" });
    }
    
    const { product, user } = req.body;
    
    console.log('Product data:', product);
    console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);

    // Check if Stripe key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return res.status(500).json({ error: "Stripe configuration missing" });
    }

    // Check if product data is provided
    if (!product || !product.name || !product.price) {
      console.error('Invalid product data:', product);
      return res.status(400).json({ error: "Invalid product data" });
    }

    console.log('Creating Stripe session with amount:', Math.round(product.price * 100));
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "inr", // Changed to INR since price is in rupees
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100), // in paise (1 rupee = 100 paise)
        },
        quantity: 1,
      }],
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      metadata: {
        product_name: product.name,
        product_price: product.price.toString(),
        buyer_name: user?.name || 'Unknown User',
        buyer_email: user?.email || 'unknown@example.com'
      },
      customer_email: user?.email || undefined
    });

    console.log('Stripe session created:', session.id);
    res.json({ 
      id: session.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: "Failed to create checkout session",
      details: error.message 
    });
  }
});

module.exports = router;
