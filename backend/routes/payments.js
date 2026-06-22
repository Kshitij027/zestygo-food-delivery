const express = require("express");
const Stripe = require("stripe");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const { items } = req.body;

  if (!secretKey) {
    return res.status(500).json({ message: "STRIPE_SECRET_KEY is not configured" });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items in cart" });
  }

  try {
    const stripe = new Stripe(secretKey);
    const origin = process.env.CLIENT_URL || "http://localhost:3000";

    const line_items = items.map(item => ({
      quantity: item.quantity,
      price_data: {
        currency: "inr",
        unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents/paise
        product_data: {
          name: item.name,
        },
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancel`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
});

module.exports = router;
