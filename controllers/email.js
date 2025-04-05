const express = require("express");
const router = express.Router();

router.post("/send-review-email", async (req, res) => {
  try {
    const { recipient, entry } = req.body;

    if (!recipient || !entry || !entry.title || !entry.text) {
      return res.status(400).json({ message: "Recipient and entry with title and text are required." });
    }

    const emailData = {
      from: {
        email: process.env.EMAIL_FROM,
        name: "Tuition Teacher",
      },
      to: [{ email: recipient }],
      subject: `Today's Lesson Review for ${entry.title}`,
      text: entry.text,
    };

    const response = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`, 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    console.log("Mailersend response status:", response.status);
    const text = await response.text();
    console.log("Mailersend response body:", text);

    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      console.error("Failed to parse response as JSON:", err);
    }

    if (response.ok) {
      return res.json({ message: "Email sent successfully!" });
    } else {
      console.error("Mailersend API response error:", data);
      return res.status(500).json({ message: "Failed to send email", error: data });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    res.status(500).json({ message: "Error occurred while sending email." });
  }
});

module.exports = router;
