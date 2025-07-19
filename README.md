# E-commerce Payment Application

A complete e-commerce payment processing system built with React frontend and Node.js backend, featuring Google OAuth authentication, Stripe payment integration, and automatic admin email notifications.

## 🚀 Features

- **User Authentication**: Google OAuth integration with session management
- **Payment Processing**: Secure Stripe payment integration
- **Email Notifications**: Automatic admin alerts for new payments
- **Admin Dashboard**: Comprehensive payment management interface
- **Duplicate Prevention**: Robust duplicate payment prevention system
- **Security**: CORS configuration, input validation, and secure session management

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **Passport.js** for Google OAuth authentication
- **Sequelize ORM** with MySQL database
- **Stripe API** for payment processing
- **Nodemailer** for email notifications
- **Express-session** for session management

### Frontend
- **React.js** with React Router
- **Custom CSS** for styling
- **Fetch API** for backend communication

## 📁 Project Structure

```
ecomm-payment-app/
├── server/
│   ├── index.js              # Main server setup
│   ├── models/
│   │   └── Payment.js        # Database model
│   ├── routes/
│   │   ├── authRoutes.js     # Authentication routes
│   │   └── payment.js        # Payment processing routes
│   └── utils/
│       └── emailService.js   # Email notification service
├── client/
│   └── src/
│       ├── components/
│       │   └── login.js      # User authentication
│       └── pages/
│           ├── PaymentPage.js    # Payment initiation
│           ├── SuccessPage.js    # Payment success handling
│           └── AdminDashboard.js # Admin interface
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- Google OAuth credentials
- Stripe account

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file using the `env.example` template:
   ```bash
   cp env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

   # Session Configuration
   SESSION_SECRET=your_session_secret

   # Email Configuration
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ADMIN_EMAIL=admin@yourdomain.com
   ```

5. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:5000/auth/google/callback`

### Stripe Setup
1. Create a [Stripe account](https://stripe.com/)
2. Get your API keys from the dashboard
3. Add them to your `.env` file

### Email Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Add email credentials to your `.env` file

## 🎯 Usage

### User Flow
1. **Login**: Users authenticate with Google OAuth
2. **Payment**: Users select products and proceed to payment
3. **Stripe Checkout**: Secure payment processing via Stripe
4. **Success**: Payment confirmation and admin notification
5. **Admin Dashboard**: Admins can view all payments

### Admin Features
- View all payment records
- Monitor payment statistics
- Receive email notifications for new payments
- Secure admin login system

## 🔒 Security Features

- **CORS Configuration**: Prevents unauthorized cross-origin requests
- **Session Management**: Secure session handling with express-session
- **Input Validation**: Comprehensive input validation and sanitization
- **Duplicate Prevention**: Prevents duplicate payment entries
- **Environment Variables**: Secure storage of sensitive configuration

## 🧪 Testing

The application includes several testing endpoints:
- Test email functionality
- Debug payment records
- Manual email triggers
- Database cleanup tools

## 🚀 Deployment

### Production Considerations
- Set up environment variables for production
- Configure a production database
- Set up proper CORS origins
- Configure email settings
- Set up SSL certificates for secure payments

### Environment Variables
Make sure to update all environment variables for production:
- Database connection strings
- OAuth redirect URIs
- Stripe webhook endpoints
- Email configuration

