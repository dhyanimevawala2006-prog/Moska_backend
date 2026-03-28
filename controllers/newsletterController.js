const { Resend } = require('resend');

exports.subscribe = async (req, res) => {
  console.log('📧 /api/newsletter/subscribe hit — body:', req.body);

  const { email } = req.body;

  // Validate
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required.' });
  }

  // Guard: fail fast if API key missing
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY env var not set');
    return res.status(500).json({ success: false, message: 'Email service not configured.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: 'MOSKA <onboarding@resend.dev>',
      to: email,
      subject: "✨ Welcome to MOSKA – You're In!",
      html: `
        <div style="font-family:'Georgia',serif;max-width:560px;margin:0 auto;background:#faf7f2;border-radius:16px;overflow:hidden;border:1px solid #e8dfd0;">
          <div style="background:linear-gradient(135deg,#2C2420,#4E3E33);padding:40px 36px;text-align:center;">
            <h1 style="color:#C5A059;font-size:32px;letter-spacing:6px;margin:0;">MOSKA</h1>
            <p style="color:rgba(240,232,224,0.7);font-size:13px;letter-spacing:2px;margin-top:8px;">CURATED LIVING</p>
          </div>
          <div style="padding:36px 36px 28px;">
            <h2 style="color:#3A2E26;font-size:22px;font-weight:400;margin-bottom:14px;">Welcome to the inner circle.</h2>
            <p style="color:#6B5744;font-size:15px;line-height:1.8;margin-bottom:20px;">
              Thank you for subscribing to <strong>MOSKA</strong>. You'll be the first to know about
              new arrivals, exclusive collections, and slow inspirations curated just for you.
            </p>
            <div style="background:#f0e8dc;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <p style="color:#3A2E26;font-size:14px;margin:0;line-height:1.9;">
                🛍️ &nbsp;<strong>New Arrivals</strong> — first access<br>
                🎁 &nbsp;<strong>Exclusive Offers</strong> — subscriber-only deals<br>
                ✨ &nbsp;<strong>Style Stories</strong> — curated inspiration
              </p>
            </div>
            <a href="https://moska-frontend.onrender.com/explore"
               style="display:inline-block;background:#3A2E26;color:#C5A059;padding:13px 32px;border-radius:40px;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:1.5px;">
              EXPLORE COLLECTION →
            </a>
          </div>
          <div style="padding:20px 36px;border-top:1px solid #e8dfd0;text-align:center;">
            <p style="color:#a08060;font-size:12px;margin:0;">© 2026 MOSKA · All rights reserved</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to send email.' });
    }

    console.log('✅ Email sent via Resend, id:', data?.id);
    res.json({ success: true, message: 'Subscribed! Check your inbox.' });

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
};
