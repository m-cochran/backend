const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');  // Enable CORS

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS to allow requests from different origins
app.use(cors());

// Parsing CSV text
app.use(bodyParser.text({ type: 'text/csv' }));

// Function to create or update a GitHub file
async function createOrUpdateGithubFile(csvContent) {
    const token = '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';  // Replace with your GitHub token
    const repoOwner = 'm-cochran';
    const repoName = 'Randomerr';
    const filePath = `orders/order_${Date.now()}.csv`;  // Unique file for each order

    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    try {
        // Check if the file already exists (to update)
        const response = await axios.get(url, {
            headers: {
                Authorization: `token ${token}`
            }
        });

        // Update the file if it exists
        const sha = response.data.sha;  // Get the current SHA of the file
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
        if (error.response && error.response.status === 404) {
            // If the file doesn't exist, create a new one
            await axios.put(url, {
                message: 'Creating CSV file',
                content: Buffer.from(csvContent).toString('base64')
            }, {
                headers: {
                    Authorization: `token ${token}`
                }
            });
        } else {
            console.error('Error uploading to GitHub:', error.response ? error.response.data : error.message);
            throw new Error('Error uploading CSV file to GitHub');
        }
    }
}

// Handle CSV upload request
app.post('/upload-csv', async (req, res) => {
    const csvContent = req.body;

    try {
        await createOrUpdateGithubFile(csvContent);
        res.send('CSV uploaded successfully!');
    } catch (error) {
        console.error('Failed to upload CSV:', error);
        res.status(500).send('Error uploading CSV to GitHub');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
