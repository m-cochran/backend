const { google } = require('googleapis');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body; // Adjust based on your form data structure

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY); // Use environment variable
  const spreadsheetId = process.env.GOOGLE_SHEET_ID; // Use environment variable

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A1', // Adjust range based on your sheet
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[name, email, message, new Date().toISOString()]],
      },
    });

    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    res.status(500).json({ error: 'Failed to write to Google Sheets' });
  }
}
