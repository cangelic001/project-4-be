const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Entry = require("../models/entry.js");
const router = express.Router();

// add routes here
router.post("/", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    const entry = await Entry.create({
      title: req.body.title,
      text,
      author: req.user._id,
    });

    const populatedEntry = await Entry.findById(entry._id).populate("author");

    res.status(201).json(populatedEntry);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const entries = await Entry.find({ author: req.user._id })
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get("/:entryId", verifyToken, async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.entryId).populate("author");

    // Check permissions:
    if (!entry.author.equals(req.user._id)) {
      return res.status(403).send("Unauthorized");
    }
    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.put("/:entryId", verifyToken, async (req, res) => {
  try {
    // Find the entry:
    const entry = await Entry.findById(req.params.entryId);

    // Check if the logged-in user is the owner:
    if (!entry.author.equals(req.user._id)) {
      return res.status(403).json({ error: "You're not allowed to do that!" });
    }

    // Destructure only allowed fields:
    const { title, text } = req.body;
    let updatedEntryData = { title };

    // If text is changed, reanalyze:
    if (text && text !== entry.text) {

      updatedEntryData.text = text;

    }

    // Update the entry:
    const updatedEntry = await Entry.findByIdAndUpdate(req.params.entryId, updatedEntryData, { new: true }).populate("author");

    // Send JSON response:
    res.status(200).json(updatedEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:entryId", verifyToken, async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.entryId);

    if (!entry.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    const deletedEntry = await Entry.findByIdAndDelete(req.params.entryId);
    res.status(200).json(deletedEntry);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
