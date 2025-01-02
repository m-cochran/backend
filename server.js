const { google } = require("googleapis");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Load Google Sheets credentials
const credentials = JSON.parse(fs.readFileSync("credentials.json", "utf8"));
const { client_email, private_key } = credentials;

// Authenticate with Google Sheets API
const auth = new google.auth.JWT(
    client_email,
    null,
    private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });

// Your Google Sheet ID (from the URL of your sheet)
const SPREADSHEET_ID = '1wPeCV9lwDu-gJarBLTHAOipb4y83RwT_Een88zHGcpc'; // Your Google Sheets ID


// Route to store purchase details
app.post("/api/store-purchase", async (req, res) => {
    const { orderId, email, items, total, date } = req.body;

    try {
        // Append data to Google Sheet
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "Sheet1!A:E", // Replace "Sheet1" with your sheet name and range
            valueInputOption: "RAW",
            resource: {
                values: [[orderId, email, JSON.stringify(items), total, date]],
            },
        });

        res.status(200).json({ message: "Purchase stored successfully" });
    } catch (err) {
        console.error("Error storing purchase:", err);
        res.status(500).json({ message: "Error storing purchase" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
