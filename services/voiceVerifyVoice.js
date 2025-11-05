const fetch = require("node-fetch");

// voiceVerifyService.js
const verifyVoiceSimilarity = async (refUrl, testUrl) => {
  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch("http://localhost:5001/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref_url: refUrl, test_url: testUrl }),
    });

    const text = await response.text(); // 👈 đọc thô để xem phản hồi thật
    console.log("📡 Flask raw response:", text);

    const data = JSON.parse(text);
    return data.score;
  } catch (err) {
    console.error("Voice verification error:", err);
    return null;
  }
};

module.exports = { verifyVoiceSimilarity };
