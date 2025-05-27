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
  <title>Your Verification Code | Jewel Samarth</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #FFD700;
      --primary-light: #FFF4CC;
      --primary-dark: #E6C300;
      --secondary: #0A2463;
      --secondary-light: #1E3A8A;
      --secondary-dark: #07152E;
      --accent: #3E92CC;
      --text: #1F2937;
      --text-light: #6B7280;
      --light-bg: #F9FAFB;
      --white: #FFFFFF;
      --gray: #E5E7EB;
      --success: #10B981;
      --warning: #F59E0B;
      --error: #EF4444;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
      --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
      --shadow-xl: 0 20px 50px rgba(0, 0, 0, 0.15);
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: var(--text);
      background-color: var(--light-bg);
      padding: 24px;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .email-container {
      max-width: 600px;
      width: 100%;
      background: var(--white);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: var(--shadow-xl);
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .email-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
    }
    
    .header {
      background: var(--secondary);
      padding: 48px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::after {
      content: '';
      position: absolute;
      top: -100px;
      right: -100px;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }
    
    .logo-container {
      position: relative;
      z-index: 2;
    }
    
    .logo {
      display: inline-block;
      width: 180px;
      height: auto;
      -webkit-user-drag: none;
      user-select: none;
      pointer-events: none;
    }
    
    .content {
      padding: 48px 40px;
    }
    
    .title {
      color: var(--secondary);
      margin-bottom: 24px;
      font-size: 28px;
      font-weight: 700;
      text-align: center;
      line-height: 1.3;
      position: relative;
      display: inline-block;
      width: 100%;
    }
    
    .title::after {
      content: '';
      display: block;
      width: 60px;
      height: 4px;
      background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
      margin: 16px auto 0;
      border-radius: 2px;
    }
    
    .username {
      color: var(--secondary);
      font-weight: 600;
      background: linear-gradient(120deg, var(--primary) 0%, var(--accent) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .subtitle {
      font-size: 16px;
      text-align: center;
      margin-bottom: 40px;
      color: var(--text-light);
      line-height: 1.6;
    }
    
    .otp-container {
      text-align: center;
      margin: 40px 0;
    }
    
    .otp-box {
      background: var(--white);
      border-radius: 16px;
      padding: 40px;
      display: inline-block;
      border: 2px dashed var(--primary);
      position: relative;
      overflow: hidden;
      transition: var(--transition);
      cursor: pointer;
      user-select: all;
      box-shadow: var(--shadow-md);
    }
    
    .otp-box:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-dark);
    }
    
    .otp-label {
      font-size: 14px;
      color: var(--text-light);
      font-weight: 600;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .otp {
      font-size: 48px;
      letter-spacing: 8px;
      color: var(--secondary);
      font-weight: 800;
      margin: 0;
      font-family: 'Courier New', monospace;
      position: relative;
      background: var(--light-bg);
      padding: 16px 24px;
      border-radius: 12px;
      display: inline-block;
    }
    
    .otp-footer {
      margin-top: 24px;
    }
    
    .expire-badge {
      background: linear-gradient(135deg, var(--warning) 0%, #F97316 100%);
      color: var(--white);
      padding: 10px 20px;
      border-radius: 50px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }
    
    .copy-hint {
      margin-top: 16px;
      font-size: 13px;
      color: var(--text-light);
      font-style: italic;
    }
    
    .security-section {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
      border-radius: 16px;
      padding: 24px;
      margin: 40px 0;
      border: 1px solid rgba(16, 185, 129, 0.15);
      position: relative;
      overflow: hidden;
    }
    
    .security-section::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      height: 60px;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2310B981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'%3E%3C/path%3E%3C/svg%3E") no-repeat center;
      opacity: 0.1;
      transform: scale(2.5);
    }
    
    .security-title {
      color: var(--success);
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 12px;
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
    
    .support-link {
      text-align: center;
      margin-top: 32px;
    }
    
    .support-link a {
      color: var(--secondary);
      text-decoration: none;
      font-weight: 600;
      transition: var(--transition);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    
    .support-link a:hover {
      color: var(--accent);
    }
    
    .footer {
      background: var(--secondary);
      padding: 24px 40px;
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
      background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
    }
    
    .footer p {
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }
    
    .social-links {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
    }
    
    .social-link {
      color: rgba(255, 255, 255, 0.7);
      transition: var(--transition);
    }
    
    .social-link:hover {
      color: var(--primary);
    }
    
    /* Mobile Responsive */
    @media (max-width: 640px) {
      body {
        padding: 16px;
      }
      
      .header, .content, .footer {
        padding: 32px 24px;
      }
      
      .title {
        font-size: 24px;
      }
      
      .otp-box {
        padding: 32px 24px;
      }
      
      .otp {
        font-size: 36px;
        letter-spacing: 6px;
        padding: 12px 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-container">
        <!-- Logo with multiple prevention techniques -->
        <div style="
          display: inline-block;
          background-image: url('https://res.cloudinary.com/dplww7z06/image/upload/v1748378717/Jewel_Samarth_Logo_tvtavg.png');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          width: 180px;
          height: 60px;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          pointer-events: none;
        "></div>
      </div>
    </div>
    
    <div class="content">
      <h2 class="title">Account Verification Code</h2>
      <p class="subtitle">
        Hello <span class="username">${username || 'Valued Customer'}</span>,<br>
        Please use the following verification code to complete your secure login:
      </p>
      
      <div class="otp-container">
        <div class="otp-box" onclick="selectOTP()" title="Click to copy">
          <div class="otp-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            VERIFICATION CODE
          </div>
          <div class="otp" id="otpCode">${otp}</div>
          <div class="otp-footer">
            <div class="expire-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Expires in 10 minutes</span>
            </div>
            <div class="copy-hint">Click to copy code</div>
          </div>
        </div>
      </div>
      
      <div class="security-section">
        <div class="security-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Security Notice</span>
        </div>
        <p class="security-text">
          For your protection, never share this verification code with anyone. Jewel Samarth will never ask for your verification code via phone, email, or text message. If you didn't request this code, please secure your account immediately.
        </p>
      </div>
      
      <div class="support-link">
        <p style="font-size: 14px; color: var(--text-light); margin-bottom: 8px;">
          Need assistance? Our team is here to help
        </p>
        <a href="mailto:support@jewelsamarth.in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          support@jewelsamarth.in
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Jewel Samarth. All rights reserved.</p>
      <div class="social-links">
        <a href="#" class="social-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
        </a>
        <a href="#" class="social-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </a>
        <a href="#" class="social-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
          </svg>
        </a>
      </div>
    </div>
  </div>
  
  <script>
    function selectOTP() {
      const otpElement = document.getElementById('otpCode');
      const range = document.createRange();
      range.selectNodeContents(otpElement);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          // Visual feedback
          otpElement.parentElement.style.borderColor = 'var(--success)';
          otpElement.parentElement.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.3)';
          setTimeout(() => {
            otpElement.parentElement.style.borderColor = 'var(--primary)';
            otpElement.parentElement.style.boxShadow = 'var(--shadow-md)';
          }, 1000);
        }
      } catch (err) {
        console.log('Copy not supported');
      }
      
      selection.removeAllRanges();
    }
    
    // Auto-select OTP on mobile devices for easier copying
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(selectOTP, 500);
      });
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