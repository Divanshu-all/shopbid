const QRCode = require('qrcode');

const generateQR = async (orderId) => {
  try {
    const qrData = JSON.stringify({
      orderId,
      platform: 'ShopBid',
      timestamp: new Date().toISOString(),
    });
    const qrBase64 = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });
    return qrBase64;
  } catch (err) {
    throw new Error('QR generation failed: ' + err.message);
  }
};

module.exports = { generateQR };
