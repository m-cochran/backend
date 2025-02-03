const express = require('express');
const axios = require('axios');
const router = express.Router();
const fs = require('fs');
require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'm-cochran';
const REPO_NAME = 'Randomerr';
const FILE_PATH = 'orders';

// Function to create or update a file in GitHub
async function uploadToGitHub(fileName, content) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}/${fileName}`;

    try {
        // Check if the file already exists
        const response = await axios.get(url, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        // If file exists, update it
        const sha = response.data.sha;
        await axios.put(url, {
            message: 'Updating order file',
            content: Buffer.from(content).toString('base64'),
            sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            // If file doesn't exist, create a new one
            await axios.put(url, {
                message: 'Creating new order file',
                content: Buffer.from(content).toString('base64')
            }, {
                headers: { Authorization: `token ${GITHUB_TOKEN}` }
            });
        } else {
            console.error('Error uploading to GitHub:', error.response ? error.response.data : error.message);
            throw new Error('Error uploading order file to GitHub');
        }
    }
}

// Endpoint to handle order submissions
router.post('/', async (req, res) => {
    try {
        const orderData = req.body;
        
        if (!orderData || Object.keys(orderData).length === 0) {
            return res.status(400).json({ error: 'Invalid order data' });
        }

        // Convert order data to CSV format
        const csvContent = Object.keys(orderData).map(key => `${key},${orderData[key]}`).join('\n');

        // Generate a unique filename
        const fileName = `order_${Date.now()}.csv`;

        // Upload the CSV file to GitHub
        await uploadToGitHub(fileName, csvContent);

        res.status(200).json({ message: 'Order saved successfully!', fileName });

    } catch (error) {
        console.error('Failed to save order:', error);
        res.status(500).json({ error: 'Failed to save order' });
    }
});

module.exports = router;
