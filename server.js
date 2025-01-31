// server.js

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/csv' }));

app.post('/upload-csv', async (req, res) => {
    const csvContent = req.body;

    const token = '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'; // Replace with your GitHub token
    const repoOwner = 'm-cochran';
    const repoName = 'Randomerr';
    const filePath = `orders/order_${Date.now()}.csv`; // Path to save the CSV

    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    try {
        // Get current file content (Check if file already exists)
        const getResponse = await axios.get(url, {
            headers: {
                Authorization: `token ${token}`
            }
        });

        // If file exists, update it
        const sha = getResponse.data.sha; // Get current SHA for the commit
        await axios.put(url, {
            message: 'Updating CSV file',
            content: Buffer.from(csvContent).toString('base64'),
            sha
        }, {
            headers: {
                Authorization: `token ${token}`
            }
        });

    } catch (error) {
        // If file doesn't exist, create it
        if (error.response && error.response.status === 404) {
            await axios.put(url, {
                message: 'Creating CSV file',
                content: Buffer.from(csvContent).toString('base64')
            }, {
                headers: {
                    Authorization: `token ${token}`
                }
            });
        } else {
            console.error(error);
            return res.status(500).send('Error uploading CSV to GitHub');
        }
    }

    res.send('CSV uploaded successfully!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
