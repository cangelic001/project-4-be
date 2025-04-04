const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    title: { type: String },
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Entry = mongoose.model("entry", entrySchema);

module.exports = Entry;
