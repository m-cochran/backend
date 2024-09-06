# Stripe Payment Backend

This is a simple backend for handling Stripe payments. It creates a payment intent and returns the client secret to the frontend.

## Setup Instructions

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Deploy the backend using Vercel.

### API Endpoint

- `POST /api/create-payment-intent`
  - Request Body: `{ "amount": <amount_in_cents> }`
  - Response: `{ "clientSecret": <client_secret> }`
