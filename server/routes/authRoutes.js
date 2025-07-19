const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:3000/dashboard"); // or wherever you want
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.redirect("http://localhost:3000");
  });
});

router.get("/user", (req, res) => {
  console.log('User endpoint called');
  console.log('Session:', req.session);
  console.log('User:', req.user);
  
  if (!req.user) {
    console.log('No user found, sending 401');
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  res.json(req.user);
});

module.exports = router;
