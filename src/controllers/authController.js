const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodeMailer");

// Modern Email Templates with Enhanced Design
const emailTemplates = {
  welcome: (username) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        :root {
          --primary: #fecc32;
          --primary-dark: #e6b82e;
          --secondary: #060675;
          --secondary-dark: #050557;
          --text: #2d3748;
          --text-light: #4a5568;
          --light-bg: #f7fafc;
          --white: #ffffff;
          --gray: #718096;
          --gray-light: #e2e8f0;
          --success: #48bb78;
          --shadow: rgba(0, 0, 0, 0.1);
          --shadow-lg: rgba(6, 6, 117, 0.15);
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: var(--text);
          max-width: 650px;
          margin: 0 auto;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container {
          background: var(--white);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 
            0 25px 50px var(--shadow-lg),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          position: relative;
        }
        
        .email-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
        }
        
        .header {
          background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
          padding: 50px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(254, 204, 50, 0.15) 0%, transparent 70%);
          border-radius: 50%;
        }
        
        .header::after {
          content: '';
          position: absolute;
          bottom: -30px;
          left: -30px;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(254, 204, 50, 0.1) 0%, transparent 70%);
          border-radius: 50%;
        }
        
        .logo-container {
          position: relative;
          z-index: 2;
          display: inline-block;
        }
        
        .logo {
          width: 200px;
          height: 60px;
          background: var(--white);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          color: var(--secondary);
          text-decoration: none;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .logo:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
        }
        
        .content {
          padding: 50px 40px;
        }
        
        .welcome-box {
          background: linear-gradient(135deg, rgba(254, 204, 50, 0.08) 0%, rgba(254, 204, 50, 0.03) 100%);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 40px;
          border: 2px solid rgba(254, 204, 50, 0.15);
          position: relative;
          overflow: hidden;
        }
        
        .welcome-box::before {
          content: '✨';
          position: absolute;
          top: 20px;
          right: 25px;
          font-size: 24px;
          opacity: 0.6;
        }
        
        h1 {
          color: var(--secondary);
          margin: 0 0 25px 0;
          font-size: 32px;
          font-weight: 800;
          text-align: center;
          line-height: 1.2;
        }
        
        .username {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
        
        .welcome-text {
          font-size: 18px;
          text-align: center;
          margin: 0 0 30px 0;
          color: var(--text-light);
          line-height: 1.7;
        }
        
        .cta-container {
          text-align: center;
          margin: 40px 0;
        }
        
        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: var(--secondary) !important;
          padding: 18px 45px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 
            0 12px 30px rgba(254, 204, 50, 0.3),
            0 0 0 1px rgba(254, 204, 50, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 
            0 18px 40px rgba(254, 204, 50, 0.4),
            0 0 0 1px rgba(254, 204, 50, 0.2);
        }
        
        .cta-button:hover::before {
          left: 100%;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          margin: 40px 0;
        }
        
        .feature-card {
          background: var(--white);
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          border: 1px solid var(--gray-light);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px var(--shadow);
          border-color: rgba(254, 204, 50, 0.3);
        }
        
        .feature-icon {
          font-size: 32px;
          margin-bottom: 15px;
          display: block;
        }
        
        .feature-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--secondary);
          margin-bottom: 8px;
        }
        
        .feature-desc {
          font-size: 14px;
          color: var(--gray);
          line-height: 1.5;
        }
        
        .info-box {
          background: linear-gradient(135deg, var(--light-bg) 0%, var(--white) 100%);
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          border: 1px solid rgba(254, 204, 50, 0.1);
          margin-top: 30px;
        }
        
        .footer {
          background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
          padding: 30px 40px;
          text-align: center;
          position: relative;
        }
        
        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(254, 204, 50, 0.5), transparent);
        }
        
        .footer p {
          color: var(--white);
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
          font-weight: 500;
        }
        
        /* Mobile Responsive */
        @media (max-width: 650px) {
          body { 
            padding: 15px;
          }
          .content, .header, .footer { 
            padding: 30px 25px;
          }
          .welcome-box { 
            padding: 25px;
          }
          h1 { 
            font-size: 26px;
          }
          .cta-button { 
            padding: 15px 35px;
            font-size: 15px;
          }
          .logo {
            width: 180px;
            height: 55px;
            font-size: 20px;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo-container">
            <div class="logo">
              JEWEL SAMARTH
            </div>
          </div>
        </div>
        <div class="content">
          <div class="welcome-box">
            <h1>Welcome to Jewel Samarth!</h1>
            <p class="welcome-text">
              Hello <span class="username">${username}</span>,
            </p>
            <p class="welcome-text">
              We're absolutely thrilled to have you join our exclusive family of jewelry enthusiasts! 
              Your journey into the world of exquisite craftsmanship and timeless elegance begins now.
            </p>
          </div>
          
          <div class="cta-container">
            <a href="https://jewelsamarth.in" class="cta-button">
              <span>🛍️</span>
              <span>Explore Our Collections</span>
            </a>
          </div>
          
          <div class="features-grid">
            <div class="feature-card">
              <span class="feature-icon">💎</span>
              <div class="feature-title">Premium Quality</div>
              <div class="feature-desc">Handcrafted jewelry with finest materials</div>
            </div>
            <div class="feature-card">
              <span class="feature-icon">🚚</span>
              <div class="feature-title">Free Shipping</div>
              <div class="feature-desc">Complimentary delivery on all orders</div>
            </div>
            <div class="feature-card">
              <span class="feature-icon">🛡️</span>
              <div class="feature-title">Lifetime Warranty</div>
              <div class="feature-desc">Protected investment with our guarantee</div>
            </div>
          </div>
          
          <div class="info-box">
            <p style="margin: 0; font-size: 15px; color: var(--gray); line-height: 1.6;">
              <strong>💫 What's Next?</strong><br>
              Follow us for exclusive offers, new arrivals, and jewelry care tips.<br>
              Get ready to discover pieces that tell your unique story.
            </p>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Jewel Samarth - Crafting Dreams into Reality</p>
        </div>
      </div>
    </body>
    </html>
  `,

  otp: (username, otp) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        :root {
          --primary: #fecc32;
          --primary-dark: #e6b82e;
          --secondary: #060675;
          --secondary-dark: #050557;
          --text: #2d3748;
          --text-light: #4a5568;
          --light-bg: #f7fafc;
          --white: #ffffff;
          --gray: #718096;
          --gray-light: #e2e8f0;
          --success: #48bb78;
          --warning: #ed8936;
          --shadow: rgba(0, 0, 0, 0.1);
          --shadow-lg: rgba(6, 6, 117, 0.15);
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: var(--text);
          max-width: 650px;
          margin: 0 auto;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container {
          background: var(--white);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 
            0 25px 50px var(--shadow-lg),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          position: relative;
        }
        
        .email-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
        }
        
        .header {
          background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
          padding: 50px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(254, 204, 50, 0.15) 0%, transparent 70%);
          border-radius: 50%;
        }
        
        .logo-container {
          position: relative;
          z-index: 2;
          display: inline-block;
        }
        
        .logo {
          width: 200px;
          height: 60px;
          background: var(--white);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          color: var(--secondary);
          text-decoration: none;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .content {
          padding: 50px 40px;
        }
        
        .title {
          color: var(--secondary);
          margin: 0 0 25px 0;
          font-size: 28px;
          font-weight: 800;
          text-align: center;
          line-height: 1.2;
        }
        
        .username {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
        
        .subtitle {
          font-size: 16px;
          text-align: center;
          margin: 0 0 40px 0;
          color: var(--text-light);
          line-height: 1.6;
        }
        
        .otp-container {
          text-align: center;
          margin: 40px 0;
        }
        
        .otp-box {
          background: linear-gradient(135deg, var(--white) 0%, #fafbfc 100%);
          border-radius: 24px;
          padding: 40px;
          display: inline-block;
          border: 3px solid rgba(254, 204, 50, 0.3);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          user-select: all;
          min-width: 280px;
        }
        
        .otp-box::before {
          content: '';
          position: absolute;
          top: -20px;
          left: -20px;
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, rgba(254, 204, 50, 0.1) 0%, transparent 70%);
          border-radius: 50%;
        }
        
        .otp-box::after {
          content: '';
          position: absolute;
          bottom: -25px;
          right: -25px;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(6, 6, 117, 0.05) 0%, transparent 70%);
          border-radius: 50%;
        }
        
        .otp-box:hover {
          transform: translateY(-3px);
          box-shadow: 
            0 20px 40px rgba(254, 204, 50, 0.2),
            0 0 0 1px rgba(254, 204, 50, 0.1);
          border-color: rgba(254, 204, 50, 0.5);
        }
        
        .otp-label {
          font-size: 14px;
          color: var(--gray);
          font-weight: 600;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          z-index: 2;
        }
        
        .otp {
          font-size: 48px;
          letter-spacing: 12px;
          color: var(--secondary);
          font-weight: 900;
          margin: 0;
          font-family: 'Courier New', 'Monaco', Consolas, monospace;
          position: relative;
          z-index: 2;
          text-shadow: 0 2px 4px rgba(6, 6, 117, 0.1);
        }
        
        .otp-footer {
          margin-top: 20px;
          position: relative;
          z-index: 2;
        }
        
        .expire-badge {
          background: linear-gradient(135deg, var(--warning) 0%, #f6ad55 100%);
          color: var(--white);
          padding: 10px 20px;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(237, 137, 54, 0.3);
        }
        
        .copy-hint {
          margin-top: 15px;
          font-size: 12px;
          color: var(--gray);
          font-style: italic;
        }
        
        .security-section {
          background: linear-gradient(135deg, rgba(72, 187, 120, 0.08) 0%, rgba(72, 187, 120, 0.03) 100%);
          border-radius: 20px;
          padding: 30px;
          margin: 40px 0;
          border: 2px solid rgba(72, 187, 120, 0.15);
          position: relative;
        }
        
        .security-section::before {
          content: '🔒';
          position: absolute;
          top: 20px;
          right: 25px;
          font-size: 24px;
          opacity: 0.6;
        }
        
        .security-title {
          color: var(--success);
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 15px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .security-text {
          color: var(--text-light);
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }
        
        .footer {
          background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
          padding: 30px 40px;
          text-align: center;
          position: relative;
        }
        
        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(254, 204, 50, 0.5), transparent);
        }
        
        .footer p {
          color: var(--white);
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
          font-weight: 500;
        }
        
        /* Mobile Responsive */
        @media (max-width: 650px) {
          body { 
            padding: 15px;
          }
          .content, .header, .footer { 
            padding: 30px 25px;
          }
          .otp-box {
            padding: 30px 20px;
            min-width: 240px;
          }
          .otp { 
            font-size: 40px;
            letter-spacing: 8px;
          }
          .title { 
            font-size: 24px;
          }
          .logo {
            width: 180px;
            height: 55px;
            font-size: 20px;
          }
          .security-section {
            padding: 25px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo-container">
            <div class="logo">
              JEWEL SAMARTH
            </div>
          </div>
        </div>
        <div class="content">
          <h2 class="title">🔐 Your Verification Code</h2>
          <p class="subtitle">
            Hello <span class="username">${username || 'Valued Customer'}</span>,<br>
            Use this secure code to verify your account and continue your journey with us.
          </p>
          
          <div class="otp-container">
            <div class="otp-box" onclick="selectOTP()" title="Click to select code">
              <div class="otp-label">Verification Code</div>
              <div class="otp" id="otpCode">${otp}</div>
              <div class="otp-footer">
                <div class="expire-badge">
                  <span>⏰</span>
                  <span>Expires in 10 minutes</span>
                </div>
                <div class="copy-hint">Click to select and copy</div>
              </div>
            </div>
          </div>
          
          <div class="security-section">
            <div class="security-title">
              <span>🛡️</span>
              <span>Security Notice</span>
            </div>
            <p class="security-text">
              For your protection, never share this verification code with anyone. Our team will never ask for your verification code via phone or email. If you didn't request this verification, please ignore this email and consider changing your account password.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 14px; color: var(--gray); margin: 0;">
              Need help? Contact our support team at 
              <a href="mailto:support@jewelsamarth.in" style="color: var(--secondary); text-decoration: none; font-weight: 600;">support@jewelsamarth.in</a>
            </p>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Jewel Samarth - Secure & Trusted</p>
        </div>
      </div>
      
      <script>
        function selectOTP() {
          const otpElement = document.getElementById('otpCode');
          if (window.getSelection && document.createRange) {
            const range = document.createRange();
            range.selectNodeContents(otpElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          } else if (document.body.createTextRange) {
            const range = document.body.createTextRange();
            range.moveToElementText(otpElement);
            range.select();
          }
          
          // Try to copy to clipboard
          try {
            document.execCommand('copy');
          } catch (err) {
            console.log('Copy not supported');
          }
        }
      </script>
    </body>
    </html>
  `
};

// Register Controller
const registerController = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields"
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword 
    });
    
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "4d"
    });

    // Send welcome email with modern template
    try {
      await transporter.sendMail({
        from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
        to: email,
        subject: "Welcome to Jewel Samarth! ✨",
        html: emailTemplates.welcome(username)
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        username,
        email,
        isAccountVerified: false
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
};

// Login Controller
const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "4d"
    });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAccountVerified: user.isAccountVerified
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};

// Logout Controller
const logoutController = (req, res) => {
  res.clearCookie("token");
  return res.json({
    success: true,
    message: "Logged out successfully"
  });
};

// Send Verification OTP Controller
const sendVerifyOtpController = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account already verified"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send OTP email with modern template
    await transporter.sendMail({
      from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
      to: user.email,
      subject: "🔐 Verify Your Jewel Samarth Account",
      html: emailTemplates.otp(user.username, otp)
    });

    return res.json({
      success: true,
      message: "Verification OTP sent"
    });

  } catch (error) {
    console.error("OTP sending error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message
    });
  }
};

// Verify OTP Controller
const verifyOtpController = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      message: "User ID and OTP are required"
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.verifyOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (Date.now() > user.verifyOtpExpireAt) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = null;
    user.verifyOtpExpireAt = null;
    await user.save();

    return res.json({
      success: true,
      message: "Account verified successfully"
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message
    });
  }
};

// Reset Password OTP Controller
const resetOtpController = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send password reset OTP with modern template
    await transporter.sendMail({
      from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
      to: user.email,
      subject: "🔒 Password Reset Code - Jewel Samarth",
      html: emailTemplates.otp(user.username, otp)
    });

    return res.json({
      success: true,
      message: "Password reset OTP sent"
    });

  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reset OTP",
      error: error.message
    });
  }
};

// Verify Reset OTP Controller
const verifyResetOtpController = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required"
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (Date.now() > user.resetOtpExpireAt) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    return res.json({
      success: true,
      message: "OTP verified"
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message
    });
  }
};

// Reset Password Controller
const resetPasswordController = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (Date.now() > user.resetOtpExpireAt) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpireAt = null;
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message
    });
  }
};

// Account Verification Check Controller
const isAccountVerified = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Account Verified Successfully",
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  sendVerifyOtpController,
  verifyOtpController,
  resetOtpController,
  verifyResetOtpController,
  resetPasswordController,
  isAccountVerified
};