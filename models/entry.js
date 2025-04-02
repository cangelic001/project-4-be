const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    title: { type: String },
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    analysis: {
      emotions: {
        sadness: { type: Number },
        joy: { type: Number },
        fear: { type: Number },
        disgust: { type: Number },
        anger: { type: Number },
      },
      sentiment: {
        score: { type: Number },
        label: { type: String },
      },
      keywords: { type: String },
      entities: { type: String },
    },
  },
  { timestamps: true }
);

const Entry = mongoose.model("entry", entrySchema);

module.exports = Entry;
