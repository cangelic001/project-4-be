const express = require("express");
const router = express.Router();

const Entry = require("../models/entry");

const verifyToken = require("../middleware/verify-token");

router.get("/:userId", verifyToken, async (req, res) => {
  try {
    if (req.user._id !== req.params.userId) {
      return res.status(403).json({ err: "Unauthorized" });
    }

    const entries = await Entry.find({ author: req.params.userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(7);

    if (!entries.length) {
      return res.status(404).json({ error: "No entries found." });
    }

    const sentimentData = entries.map((entry) => ({
      date: entry.createdAt.toISOString().split("T")[0], // Format: YYYY-MM-DD
      score: entry.analysis.sentiment.score,
    }));

    const emotionsData = entries.map((entry) => ({
      date: entry.createdAt.toISOString().split("T")[0],
      emotions: entry.analysis.emotions,
    }));

    const countOccurrences = (items) => {
      return items.flatMap((item) => item || []).reduce((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      }, {});
    };

    const keywordData = countOccurrences(entries.flatMap((entry) => entry.analysis.keywords));
    const entityData = countOccurrences(entries.flatMap((entry) => entry.analysis.entities));


    res.json({ sentimentData, emotionsData, keywordData, entityData });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
