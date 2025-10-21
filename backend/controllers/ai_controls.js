import AIModel from "../models/aimodel.js";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import axios from "axios";

dotenv.config();

const WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";
const WEATHER_API_BASE = "http://api.weatherapi.com/v1/current.json";
const CURRENCY_API = ` https://v6.exchangerate-api.com/v6/${process.env.currency_api_key}/pair` ;

export const userQuery = async (req, res) => {
  const { message } = req.body;

  try {
    const groqKey = process.env.GROQ_API_KEY || process.env.groq_api;
    if (!groqKey) {
      return res
        .status(500)
        .json({ error: "Missing GROQ API key. Set GROQ_API_KEY or groq_api in your .env" });
    }

    const groq = new Groq({ apiKey: groqKey });

    // Step 1: Ask model what type of query it is
    const intentResponse = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b", // replace with your actual model (e.g., "gpt-oss-20b")
      messages: [
        {
          role: "system",
          content:
            "You are an AI that identifies user queries. Respond only in valid JSON format like: {\"type\": \"weather\"|\"currency\"|\"both\",\"location\":\"...\", \"details\": {...}}",
        },
        { role: "user", content: message },
      ],
    });

    let intent = intentResponse.choices[0]?.message?.content?.trim() || "{}";
    console.log("Intent raw:", intent);

    // Safely parse JSON
    let parsedIntent;
    try {
      parsedIntent = JSON.parse(intent);
    } catch {
      parsedIntent = { type: "unknown", details: {} };
    }

    const resultData = {};
    const type = parsedIntent.type;

    // Step 2: Handle weather
    // if (type === "weather" || type === "both") {
    //   const location = parsedIntent.location ;
    //   console.log( "location is : ",location);
      
    //   const weatherRes = await axios.get(
    //     `${WEATHER_API}?q=${location}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    //   );
    //   resultData.weather = weatherRes.data;
    // }

     if (type === "weather" || type === "both") {
      const location = parsedIntent?.location;
      console.log("🌦 Location is:", location);

      if (!location) throw new Error("Location missing for weather query");

      const weatherRes = await axios.get(WEATHER_API_BASE, {
        params: {
          key: process.env.WEATHER_API_KEY,
          q: location,
        },
      });

      resultData.weather = weatherRes.data;
    }

    // Step 3: Handle currency
    if (type === "currency" || type === "both") {
      const from = parsedIntent.details?.from || "USD";
      const to = parsedIntent.details?.to || "INR";
      const amount = parsedIntent.details?.amount || 1;
      const currencyRes = await axios.get(
        `${CURRENCY_API}/${from}/${to}/${amount}`
      );
      resultData.currency = currencyRes.data;
    }



    // Step 4: Generate human-readable final response
    const finalResponse = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that formats data from APIs into a clear, friendly human-readable explanation.",
        },
        {
          role: "user",
          content: `User asked: ${message}\nHere is the API data: ${JSON.stringify(resultData)}`,
        },
      ],
    });

    const aiResponse = finalResponse.choices[0]?.message?.content || "No response generated";

    // Step 5: Save to DB
    const log = await AIModel.create({
      userquery: message,
      airesponse: aiResponse,
      type,
      data: resultData,
    });

    console.log("✅ Log saved:", log);
    res.status(200).json(log);
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Failed to process query", details: err.message });
  }
};