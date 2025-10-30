const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/bankdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const accountSchema = new mongoose.Schema({
  name: String,
  balance: Number,
});

const Account = mongoose.model("Account", accountSchema);

app.post("/transfer", async (req, res) => {
  const { sender, receiver, amount } = req.body;

  if (!sender || !receiver || !amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid input data." });
  }

  try {
    const senderAccount = await Account.findOne({ name: sender });
    const receiverAccount = await Account.findOne({ name: receiver });

    if (!senderAccount || !receiverAccount) {
      return res.status(404).json({ error: "Sender or receiver not found." });
    }

    if (senderAccount.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    senderAccount.balance -= amount;
    receiverAccount.balance += amount;

    await senderAccount.save();
    await receiverAccount.save();

    res.json({
      message: "Transfer successful.",
      sender: { name: senderAccount.name, balance: senderAccount.balance },
      receiver: { name: receiverAccount.name, balance: receiverAccount.balance },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

app.get("/accounts", async (req, res) => {
  const accounts = await Account.find();
  res.json(accounts);
});

app.post("/create", async (req, res) => {
  const { name, balance } = req.body;
  if (!name || balance == null) {
    return res.status(400).json({ error: "Invalid data." });
  }
  const newAccount = new Account({ name, balance });
  await newAccount.save();
  res.json({ message: "Account created successfully.", account: newAccount });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
