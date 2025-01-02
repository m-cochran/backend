const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe Secret Key (ensure it's set as an env variable)
const fetch = require('node-fetch');
const { Octokit } = require('@octokit/core'); // GitHub API package
const app = express();

app.use(bodyParser.json());

// Hardcode the GitHub token for testing
const githubToken = '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'; // Replace this with your actual GitHub token for testing

// GitHub API credentials
const octokit = new Octokit({
  auth: githubToken,  // Using the hardcoded GitHub token for testing
});

const REPO_OWNER = 'm-cochran'; // Replace with your GitHub username
const REPO_NAME = 'backend.github.io'; // Replace with your GitHub repository name
const FILE_PATH = 'orders.json'; // Path to the file in the repository

// Helper function to get orders from GitHub
const getOrdersFromGitHub = async () => {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
    });
    
    const content = Buffer.from(response.data.content, 'base64').toString();
    return JSON.parse(content);
  } catch (err) {
    console.error('Error fetching data from GitHub:', err);
    return [];
  }
};

// Helper function to update orders in GitHub
const updateOrdersInGitHub = async (orders) => {
  try {
    // Get the current file's SHA for updating
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
    });

    const sha = response.data.sha;

    // Update the orders file with new content
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
      message: 'Update orders.json with new order',
      content: Buffer.from(JSON.stringify(orders, null, 2)).toString('base64'),
      sha: sha, // Required for updating an existing file
    });
  } catch (err) {
    console.error('Error updating data on GitHub:', err);
  }
};

app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, email, phone, name, address, shippingAddress, cartItems } = req.body;

  try {
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        email,
        phone,
        name,
        address: JSON.stringify(address),
        shippingAddress: JSON.stringify(shippingAddress),
        cartItems: JSON.stringify(cartItems),
      },
    });

    // Fetch the existing orders from GitHub
    const orders = await getOrdersFromGitHub();

    // Add new order
    const newOrder = {
      id: paymentIntent.id,
      userId: email,
      amount: paymentIntent.amount,
      paymentStatus: paymentIntent.status,
      cartItems,
      shippingAddress,
      billingAddress: address,
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);

    // Update the orders file on GitHub
    await updateOrdersInGitHub(orders);

    // Respond with success
    res.json({ success: true, orderId: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
