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

  if (req.method === "POST") {
    const { orderId, cartItems, customerDetails } = req.body;

    try {
      // Authenticate with Google Sheets API using the service account credentials
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      // Initialize the Google Sheets API client
      const sheets = google.sheets({ version: "v4", auth });

      const spreadsheetId = process.env.SHEET_ID; // Your Google Sheet ID
      const range = "Sheet1!A1"; // Sheet and range to append data

      // Data to append
      const values = [
        [
          orderId,
          customerDetails.name,
          customerDetails.email,
          JSON.stringify(cartItems),
          new Date().toISOString(),
        ],
      ];

      // Append the data to the Google Sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        resource: { values },
      });

      // Return a success response
      res.status(200).json({ success: true });
    } catch (error) {
      // Return an error response if something goes wrong
      res.status(500).json({ error: error.message });
    }
  } else {
    // If the request method is not POST, return a 405 error
    res.status(405).json({ error: "Method not allowed" });
  }
}
