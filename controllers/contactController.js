const Contact = require("../models/contactModel");

// POST /api/contact — save message
const sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email and message are required." });
    }
    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({ success: true, message: "Message received! We'll get back to you soon.", data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// GET /api/contact — admin: get all messages
const getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// PATCH /api/contact/:id/status — admin: mark read/replied
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!contact) return res.status(404).json({ success: false, message: "Message not found" });
    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

module.exports = { sendMessage, getAllMessages, updateStatus };
