const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Helper to look for downloaded Google OAuth Credentials JSON
function findCredentialsFile() {
  const possibleNames = ['credentials.json', 'client_secret.json', 'oauth_credentials.json'];
  for (const name of possibleNames) {
    const fullPath = path.join(__dirname, name);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  // Check for any file starting with client_secret
  const files = fs.readdirSync(__dirname);
  const matched = files.find(f => f.startsWith('client_secret') && f.endsWith('.json'));
  if (matched) return path.join(__dirname, matched);
  return null;
}

// POST endpoint for appointment booking
app.post('/api/book', async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: Name, Email, and Phone are required.'
    });
  }

  const selectedService = service || 'None Preferred';
  const userMessage = message || 'No additional message provided.';

  console.log('\n--- NEW APPOINTMENT REQUEST RECEIVED ---');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Phone: ${phone}`);
  console.log(`Preferred Service: ${selectedService}`);
  console.log(`Message: ${userMessage}`);
  console.log('----------------------------------------\n');

  try {
    const credPath = findCredentialsFile();
    let emailSent = false;

    if (credPath) {
      console.log(`Found Google OAuth Credentials at: ${credPath}`);
      const rawCreds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      const credentials = rawCreds.installed || rawCreds.web || rawCreds;

      const { client_id, client_secret, redirect_uris } = credentials;
      const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris ? redirect_uris[0] : 'https://developers.google.com/oauthplayground'
      );

      // If refresh token exists in environment or token.json
      const tokenPath = path.join(__dirname, 'token.json');
      if (fs.existsSync(tokenPath)) {
        const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        oAuth2Client.setCredentials(tokens);

        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

        const emailLines = [
          `To: kin@ushunhealth.com`,
          `From: ${name} <${email}>`,
          `Subject: New Appointment Request: ${name} (${selectedService})`,
          `Content-Type: text/plain; charset=utf-8`,
          ``,
          `You have received a new appointment booking request from the House of Fok website:`,
          ``,
          `Full Name: ${name}`,
          `Email Address: ${email}`,
          `Phone Number: ${phone}`,
          `Preferred Specialization: ${selectedService}`,
          `Message / Notes:`,
          `${userMessage}`,
          ``,
          `---`,
          `Submitted via House of Fok (ushunhealth.com)`
        ];

        const rawMessage = Buffer.from(emailLines.join('\n'))
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        await gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw: rawMessage }
        });

        console.log('Successfully sent email to kin@ushunhealth.com via Gmail API!');
        emailSent = true;
      } else {
        console.log('OAuth credentials present. Waiting for token.json to perform authorized Gmail dispatch.');
      }
    } else {
      console.log('No credentials.json file found in root directory yet. Request logged cleanly to server console.');
    }

    return res.status(200).json({
      success: true,
      message: 'Appointment request received! Kin Leung Fok will contact you shortly.',
      emailSent
    });

  } catch (error) {
    console.error('Error processing appointment email via Gmail API:', error);
    // Still return success to user while logging server error
    return res.status(200).json({
      success: true,
      message: 'Appointment request logged! We will reach out to you directly.',
      error: error.message
    });
  }
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`House of Fok (USHUN Health) Node.js Server Running`);
  console.log(`Access website at: http://localhost:${PORT}`);
  console.log(`API endpoint ready: POST http://localhost:${PORT}/api/book`);
  console.log(`==================================================\n`);
});
