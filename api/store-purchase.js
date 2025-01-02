const express = require("express");
const app = express();

app.use(express.json());

app.post("/api/store-purchase", (req, res) => {
    const { orderId, email, items, total, date } = req.body;

    // Store data in your database (e.g., MongoDB, Firebase, MySQL)
    database.collection("purchases").insertOne({
        orderId,
        email,
        items,
        total,
        date
    }).then(result => {
        res.status(200).json({ message: "Purchase stored successfully" });
    }).catch(err => {
        console.error(err);
        res.status(500).json({ message: "Error storing purchase" });
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));
