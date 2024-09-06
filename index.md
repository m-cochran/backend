---
layout: default
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stripe Checkout</title>
  <script src="https://js.stripe.com/v3/"></script>
</head>
<body>
  <h1>Enter Amount</h1>
  <form id="payment-form">
    <label for="amount">Amount (in dollars):</label>
    <input id="amount" type="number" step="0.01" min="0.01" required>

    <label for="card-element">Card Details:</label>
    <div id="card-element"></div>
    
    <button id="submit">Pay</button>
    <div id="payment-status"></div>
  </form>

  <script>
    var stripe = Stripe('pk_test_51PulULDDaepf7cjiBCJQ4wxoptuvOfsdiJY6tvKxW3uXZsMUome7vfsIORlSEZiaG4q20ZLSqEMiBIuHi7Fsy9dP00nytmrtYb'); // Replace with your Stripe publishable key
    var elements = stripe.elements();
    var card = elements.create('card');
    card.mount('#card-element');

    var form = document.getElementById('payment-form');
    form.addEventListener('submit', function(event) {
      event.preventDefault();

      var amount = document.getElementById('amount').value;
      if (!amount || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      fetch('/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Math.round(amount * 100) }), // Convert dollars to cents
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        return stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: card,
            billing_details: {
              name: 'Customer',
            },
          },
        });
      })
      .then(function(result) {
        if (result.error) {
          document.getElementById('payment-status').innerText = result.error.message;
        } else {
          if (result.paymentIntent.status === 'succeeded') {
            document.getElementById('payment-status').innerText = 'Payment succeeded!';
          }
        }
      });
    });
  </script>
</body>
</html>

The final element.
```
