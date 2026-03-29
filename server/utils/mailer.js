const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendWinnerEmail = async ({ to, buyerName, productTitle, orderId, qrCode, shopName, shopAddress, amount }) => {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 28px; }
        .header p { color: #a0aec0; margin: 8px 0 0; }
        .badge { display: inline-block; background: #22C55E; color: white; padding: 6px 16px; border-radius: 20px; font-weight: bold; margin-top: 12px; }
        .body { padding: 32px; }
        .product-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .product-info h3 { margin: 0 0 12px; color: #1a1a2e; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .row:last-child { border-bottom: none; }
        .label { color: #718096; font-size: 14px; }
        .value { font-weight: bold; color: #1a1a2e; }
        .qr-section { text-align: center; padding: 24px; background: #f8f9fa; border-radius: 8px; margin: 24px 0; }
        .qr-section img { width: 200px; height: 200px; }
        .qr-section p { color: #718096; font-size: 13px; margin-top: 12px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #a0aec0; font-size: 12px; }
        .order-id { font-family: monospace; background: #1a1a2e; color: #00C2A8; padding: 8px 16px; border-radius: 6px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 You Won!</h1>
          <p>Congratulations, ${buyerName}!</p>
          <span class="badge">Auction Winner</span>
        </div>
        <div class="body">
          <p>You've won the auction for <strong>${productTitle}</strong>. Show the QR code below at the shop to collect your item.</p>
          
          <div class="product-info">
            <h3>📦 Order Details</h3>
            <div class="row"><span class="label">Product</span><span class="value">${productTitle}</span></div>
            <div class="row"><span class="label">Winning Bid</span><span class="value">₹${amount}</span></div>
            <div class="row"><span class="label">Shop</span><span class="value">${shopName}</span></div>
            <div class="row"><span class="label">Address</span><span class="value">${shopAddress}</span></div>
          </div>

          <div class="qr-section">
            <p style="font-weight:bold; color:#1a1a2e; margin-bottom: 12px;">Your Order QR Code</p>
            <img src="${qrCode}" alt="Order QR Code" />
            <p>Show this QR to the shopkeeper to collect your item.</p>
            <p>Order ID: <span class="order-id">${orderId}</span></p>
          </div>

          <p style="color: #718096; font-size: 13px;">⚠️ This QR code is valid for one-time use only. Please collect your item within 3 days.</p>
        </div>
        <div class="footer">
          <p>ShopBid — Hyperlocal Auction Marketplace</p>
          <p>This email was sent to ${to}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"ShopBid 🛍️" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎉 You won "${productTitle}" on ShopBid!`,
    html,
  });
};

const sendOutbidEmail = async ({ to, buyerName, productTitle, currentBid, productId }) => {
  const transporter = createTransporter();
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
      <h2 style="color:#FF4D4D;">⚡ You've been outbid!</h2>
      <p>Hi ${buyerName}, someone placed a higher bid on <strong>${productTitle}</strong>.</p>
      <p>Current highest bid: <strong>₹${currentBid}</strong></p>
      <a href="${process.env.CLIENT_URL}/product/${productId}" 
         style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:12px;">
        🔥 Bid Again
      </a>
      <p style="color:#718096;font-size:12px;margin-top:20px;">ShopBid — Hyperlocal Auction Marketplace</p>
    </div>
  `;
  await transporter.sendMail({
    from: `"ShopBid 🛍️" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⚡ You've been outbid on "${productTitle}"`,
    html,
  });
};

module.exports = { sendWinnerEmail, sendOutbidEmail };

const sendPaymentRequestEmail = async ({ to, buyerName, productTitle, amount, productId, deadline, upiId, shopName, txnCode }) => {
  const transporter = createTransporter();
  const minutesLeft = Math.floor((new Date(deadline) - new Date()) / 60000);
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#0a0a0f;color:#fff;border-radius:12px;">
      <h2 style="color:#00C2A8;">🏆 You won! Complete payment now</h2>
      <p>Hi ${buyerName}, you have the highest bid on <strong>${productTitle}</strong>.</p>
      <div style="background:#1a1a2e;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;font-size:24px;font-weight:bold;color:#00C2A8;">₹${amount}</p>
        <p style="margin:4px 0 0;color:#a0aec0;font-size:14px;">Amount to pay</p>
      </div>

      <!-- Transaction Code Box -->
      <div style="background:#7B5EA7;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
        <p style="margin:0 0 6px;color:#e2d9f3;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Your Transaction Code</p>
        <p style="margin:0;font-size:28px;font-weight:bold;color:#fff;font-family:monospace;letter-spacing:4px;">${txnCode}</p>
        <p style="margin:8px 0 0;color:#e2d9f3;font-size:12px;">Include this in UPI payment note. You will enter this on the site to confirm payment.</p>
      </div>

      ${upiId ? `
      <div style="background:#1a1a2e;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #00C2A8;">
        <p style="margin:0 0 8px;color:#a0aec0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Pay via UPI</p>
        <p style="margin:0;font-size:20px;font-weight:bold;color:#fff;font-family:monospace;">${upiId}</p>
        <p style="margin:4px 0 0;color:#a0aec0;font-size:13px;">Send ₹${amount} to ${shopName} · Add code <strong>${txnCode}</strong> in remarks</p>
      </div>` : ''}

      <p style="color:#FF4D4D;font-weight:bold;">⏰ You have ${minutesLeft} minutes to complete payment (max 5 min)!</p>
      <p style="color:#a0aec0;font-size:13px;">After paying, go back to the product page and enter the transaction code to confirm.</p>
      <a href="${process.env.CLIENT_URL}/product/${productId}"
         style="display:inline-block;background:#00C2A8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:12px;font-weight:bold;">
        Go to Product Page
      </a>
      <p style="color:#718096;font-size:12px;margin-top:20px;">ShopBid — Hyperlocal Auction Marketplace</p>
    </div>
  `;
  await transporter.sendMail({
    from: `"ShopBid 🛍️" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⏰ Pay now to claim "${productTitle}" on ShopBid! Code: ${txnCode}`,
    html,
  });
};

module.exports = { sendWinnerEmail, sendOutbidEmail, sendPaymentRequestEmail };
