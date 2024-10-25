const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "elinor8@ethereal.email",
    pass: "g2m5pXHu4yuBytrKnw",
  },
});

router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const verificationCode = crypto.randomBytes(3).toString('hex');

    const user = new User({ firstName, lastName, email, password, verificationCode });

    await user.save();

    let sendEMail = await transporter.sendMail({
      from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
      to: email,
      subject: 'Verify Your Email',
      text: `Hello ${firstName},\n\nYour verification code is: ${verificationCode}\n\nThank you for registering!`,
    });
    console.log("sendEMail",sendEMail)
    res.status(201).json({ message: 'User registered! Please check your email for the verification code.' });
  } catch (error) {
    console.log("error",error)
    res.status(400).json({ error: 'Error registering user', details: error.message });
  }
});


router.post('/verify', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

 
    const user = await User.findOne({ email, verificationCode });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification code or email' });
    }


    user.isVerified = true;
    user.verificationCode = null; 
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    res.status(400).json({ error: 'Error verifying email', details: error.message });
  }
});

module.exports = router;
