const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const suggestCategory = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.json({ category: "other" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // use stable model
      contents: `
          You are an expense categorizer.
          Categories:
          food, salary, travel, shopping, transport, movies, medicine, electricity, rent, fuel, others

          Examples:
          pizza → food
          uber ride → transport
          bus fare → transport
          train ticket → transport
          salary,bonus, credited → salary
          movie ticket → movies

          Now categorize:

          Expense: ${title}

          
          
          
          Answer only one word.
`,
    });

    let category = response.text.trim().toLowerCase();

    // clean output
    category = category.replace(/[^a-z]/g, "");

    res.json({ category });
  } catch (err) {
    console.log(err);
    res.json({ category: "others" });
  }
};

module.exports = {
  suggestCategory,
};
