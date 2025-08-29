import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// Helpers
const isNumericString = (s) => /^-?\d+$/.test(s);
const isAlphaString = (s) => /^[A-Za-z]+$/.test(s);
const isSpecialOnly = (s) => /^[^A-Za-z0-9]+$/.test(s);

function toStringToken(x) {
  return typeof x === "string" ? x : String(x);
}

function buildConcatStringFromAlphaChars(rawData) {
  const chars = [];
  for (const item of rawData) {
    const tok = toStringToken(item);
    for (const ch of tok) {
      if (/[A-Za-z]/.test(ch)) chars.push(ch);
    }
  }
  const rev = chars.reverse();
  return rev
    .map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
    .join("");
}

app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body || {};
    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        message: 'Invalid payload: expected { "data": [...] }',
      });
    }

    const even_numbers = [];
    const odd_numbers = [];
    const alphabets = [];
    const special_characters = [];
    let sum = 0;

    for (const item of data) {
      const tok = toStringToken(item);

      if (isNumericString(tok)) {
        const n = parseInt(tok, 10);
        if (Math.abs(n) % 2 === 0) {
          even_numbers.push(tok);
        } else {
          odd_numbers.push(tok);
        }
        sum += n;
      } else if (isAlphaString(tok)) {
        alphabets.push(tok.toUpperCase());
      } else if (isSpecialOnly(tok)) {
        special_characters.push(tok);
      }
    }

    const concat_string = buildConcatStringFromAlphaChars(data);

    return res.status(200).json({
      is_success: true,
      user_id: `${process.env.FULL_NAME}_${process.env.DOB_DDMMYYYY}`,
      email: process.env.EMAIL,
      roll_number: process.env.ROLL_NUMBER,
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: String(sum),
      concat_string,
    });
  } catch (err) {
    return res.status(500).json({
      is_success: false,
      message: "Internal server error",
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`BFHL API running on port ${port}`);
});
