const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const axios = require("axios");
const authController = {
  // Register worker
  // file ke top pe hona chahiye (IMPORTANT)
  

  register: async (req, res) => {
    try {
      const { name, email, password, phone, location, deliveryPlatform, averageWeeklyIncome } = req.body;

      // 1️⃣ Check if user exists (pehle karo — unnecessary AI call avoid hoga)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // 2️⃣ AI CALL
      let riskData = null;

      try {
        const aiResponse = await axios.post(
          "https://gigarmor-aiservice.onrender.com/calculate-risk",
          {
            location: {
              latitude: Number(location?.latitude) || 19.0760,
              longitude: Number(location?.longitude) || 72.8777
            },
            deliveryPlatform,
            averageWeeklyIncome
          }
        );

        riskData = aiResponse.data;
        console.log("AI Risk:", riskData);

      } catch (err) {
        console.error("AI service error:", err.message);
      }

      // 3️⃣ Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 4️⃣ Create user (🔥 riskScore add kiya)
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        location,
        deliveryPlatform,
        averageWeeklyIncome,
        riskScore: riskData?.riskScore || 0
      });

      await user.save();

      // 5️⃣ Generate token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // 6️⃣ Response
      res.status(201).json({
        token,
        user: {
          id: user._id,
          name,
          email,
          role: user.role,
          riskScore: user.riskScore
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  },
  // Login worker/admin
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  },

  // Verify token (middleware helper)
  verifyToken: (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  }
};

module.exports = authController;