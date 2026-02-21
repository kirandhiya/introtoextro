const express = require("express");
const fs = require("fs");
const OpenAI = require("openai");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

let data = require("./data.json");

// ⚠️ Add your API key here
const openai = new OpenAI({
  apiKey: "YOUR_OPENAI_API_KEY"
});

// ================= ROUTINE =================
app.get("/routine/:profession", (req, res) => {
  const profession = req.params.profession;
  let base = data.routines[profession];

  if (!base) return res.json(["Start small today."]);

  let shuffled = base.sort(() => 0.5 - Math.random());
  res.json(shuffled.slice(0, 2));
});

// ================= STREAK =================
app.get("/streak", (req, res) => {
  res.json({
    streak: data.streak,
    badges: data.badges,
    completedTasks: data.completedTasks
  });
});

app.post("/streak", (req, res) => {
  const today = new Date().toDateString();

  if (data.lastCompleted !== today) {
    data.streak += 1;
    data.completedTasks += 1;
    data.lastCompleted = today;

    if (data.streak === 7) data.badges.push("🔥 7 Day Warrior");
    if (data.streak === 30) data.badges.push("🏆 Confidence Master");
  }

  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
  res.json({ streak: data.streak });
});

// ================= AI GENERATOR =================
app.post("/generate", async (req, res) => {
  const { profession } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: Give 3 small daily confidence challenges for a ${profession} in India
        }
      ]
    });

    res.json({ result: response.choices[0].message.content });

  } catch (error) {
    res.json({ result: "AI currently unavailable." });
  }
});

app.listen(PORT, () => {
  console.log(Server running at http://localhost:${PORT});
});
