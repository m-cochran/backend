const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// Convert order data to CSV format
function convertToCSV(orderData) {
    const headers = Object.keys(orderData).join(',');
    const values = Object.values(orderData).map(value => `"${value}"`).join(',');
    return `${headers}\n${values}`;
}

// Function to upload CSV to GitHub
async function uploadToGitHub(csvContent) {
    const token = process.env.GITHUB_TOKEN;
    const repoOwner = 'm-cochran';
    const repoName = 'Randomerr';
    const filePath = `orders/order_${Date.now()}.csv`; 
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    try {
        await axios.put(url, {
            message: 'New order uploaded',
            content: Buffer.from(csvContent).toString('base64')
        }, {
            headers: { Authorization: `token ${token}` }
        });

        return { success: true, message: 'Order uploaded successfully!' };
    } catch (error) {
        console.error('GitHub Upload Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to upload order to GitHub');
    }
}

// Route to handle order submission
router.post('/save-order', async (req, res) => {
    try {
        const orderData = req.body;
        if (!orderData || Object.keys(orderData).length === 0) {
            return res.status(400).json({ error: 'Invalid order data' });
        }

        const csvContent = convertToCSV(orderData);
        const result = await uploadToGitHub(csvContent);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
