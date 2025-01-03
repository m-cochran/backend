const { google } = require("googleapis");


export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');  // For allowing all domains
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');  // Allow relevant methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');  // Allow specific headers

  if (req.method === 'OPTIONS') {
    // Handle preflight request
    return res.status(200).end();
  }

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const { orderId, cartItems, customerDetails } = req.body;

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });

      const spreadsheetId = process.env.SHEET_ID; // Your Google Sheet ID
      const range = "PurchaseData!A1"; // Sheet and range to append data
      const values = [[
        orderId,
        customerDetails.name,
        customerDetails.email,
        JSON.stringify(cartItems),
        new Date().toISOString(),
      ]];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        resource: { values },
      });

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
