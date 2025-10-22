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


// export const userQueryStream = async (req, res) => {
//   const { message } = req.body;
//   const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

//   // Setup Server-Sent Events (SSE)
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.flushHeaders();

//   try {
//     // Step 1: Get intent
//     const intentResponse = await groq.chat.completions.create({
//       // model: "openai/gpt-oss-20b",
//       model:"llama-3.1-8b-instant",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are an AI that identifies user queries. Respond only in valid JSON format like: {\"type\": \"weather\"|\"currency\"|\"both\",\"location\":\"...\", \"details\": {...}}",
//         },
//         { role: "user", content: message },
//       ],
//     });

//     let parsedIntent;
//     try {
//       parsedIntent = JSON.parse(intentResponse.choices[0].message.content.trim());
//     } catch {
//       parsedIntent = { type: "unknown", details: {} };
//     }

//     // Step 2: Fetch weather/currency data
//     const resultData = {};
//     if (parsedIntent.type === "weather" || parsedIntent.type === "both") {
//       const location = parsedIntent?.location;
//       if (location) {
//         const weatherRes = await axios.get(WEATHER_API_BASE, {
//           params: { key: process.env.WEATHER_API_KEY, q: location },
//         });
//         resultData.weather = weatherRes.data;
//       }
//     }

//     if (parsedIntent.type === "currency" || parsedIntent.type === "both") {
//       const from = parsedIntent.details?.from || "USD";
//       const to = parsedIntent.details?.to || "INR";
//       const amount = parsedIntent.details?.amount || 1;
//       const currencyRes = await axios.get(`${CURRENCY_API}/${from}/${to}/${amount}`);
//       resultData.currency = currencyRes.data;
//     }

//     // Step 3: Stream Groq response token-by-token
//     const stream = await groq.chat.completions.create({
//       // model: "openai/gpt-oss-20b",
//        model:"llama-3.1-8b-instant",
//       stream: true,
//       messages: [
//         {
//       role: "system",
//       content: `
//         You are an AI assistant that outputs plain, human-readable text.
// send complete words when streaming, do not send single letters or partial words.
// Format output clearly with:
// - Section titles/headings on their own line
// - Bullet points using "-" for lists
// - Labels like "Base Currency", "Target Currency" etc.
// - Numbers and units normally, e.g., 87.93 INR
// - Use spacing and newlines for readability
// give a breef concise response
// also add a conclusion at the end
//       `,
// },

//         {
//           role: "user",
//           content: `User asked: ${message}\nHere is the API data: ${JSON.stringify(resultData)}`,
//         },
//       ],
//     });

//     for await (const chunk of stream) {
//       const token = chunk.choices[0]?.delta?.content || "";
//       res.write(`data: ${token}\n\n`);
//     }

//     res.write("data: [DONE]\n\n");
//     res.end();
//   } catch (err) {
//     console.error("❌ Stream error:", err);
//     res.write(`data: [ERROR] ${err.message}\n\n`);
//     res.end();
//   }
// };

// ... (Your existing imports)

export const userQueryStream = async (req, res) => {
  const { message } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // Setup Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    // ... (Your existing intent parsing and data fetching logic)
    const resultData = {};
    let parsedIntent;
    try {
      const intentResponse = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that identifies user queries. Respond only in valid JSON format like: {\"type\": \"weather\"|\"currency\"|\"both\",\"location\":\"...\", \"details\": {...}}",
          },
          { role: "user", content: message },
        ],
      });
      parsedIntent = JSON.parse(intentResponse.choices[0].message.content.trim());
    } catch (err) {
      console.error("Error parsing intent:", err);
      parsedIntent = { type: "unknown", details: {} };
    }
    
    if (parsedIntent.type === "weather" || parsedIntent.type === "both") {
      const location = parsedIntent?.location;
      if (location) {
        const weatherRes = await axios.get(WEATHER_API_BASE, {
          params: { key: process.env.WEATHER_API_KEY, q: location },
        });
        resultData.weather = weatherRes.data;
      }
    }
    
    if (parsedIntent.type === "currency" || parsedIntent.type === "both") {
      const from = parsedIntent.details?.from || "USD";
      const to = parsedIntent.details?.to || "INR";
      const amount = parsedIntent.details?.amount || 1;
      const currencyRes = await axios.get(`${CURRENCY_API}/${from}/${to}/${amount}`);
      resultData.currency = currencyRes.data;
    }

    // Step 3: Stream Groq response with server-side processing
    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that outputs plain, human-readable text.
            Format output clearly with:
            - Section titles/headings on their own line
            - Bullet points using "-" for lists
            - Labels like "Base Currency", "Target Currency" etc.
            - Numbers and units normally, e.g., 87.93 INR
            - Use spacing and newlines for readability
            Give a brief, concise response.
            Also add a conclusion at the end.`,
        },
        {
          role: "user",
          content: `User asked: ${message}\nHere is the API data: ${JSON.stringify(resultData)}`,
        },
      ],
    });

    let buffer = "";
    const wordBoundaryRegex = /[\s.,!?;:]/g;


    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || "";
      
      // Append the new token to the buffer
      buffer += token;

      // Check if the buffer contains a complete word or a newline
      // This is the core of the server-side buffering logic
      let lastBoundaryIndex = -1;
      let lastNewlineIndex = buffer.lastIndexOf("\n");

      if (lastNewlineIndex > -1) {
        // We have a newline, so flush everything up to it
        lastBoundaryIndex = lastNewlineIndex;
      } else {
        // No newline, check for a word boundary
        const matches = [...buffer.matchAll(wordBoundaryRegex)];
        if (matches.length > 0) {
            lastBoundaryIndex = matches[matches.length - 1].index;
        }
      }

      if (lastBoundaryIndex > -1) {
        // Extract the complete word or sentence
        const flushableText = buffer.slice(0, lastBoundaryIndex + 1);

        // Normalize spacing before sending
        const normalizedText = flushableText.replace(/\s+/g, " ");

        // Send the normalized text chunk to the client
        res.write(`data: ${normalizedText}\n\n`);
        
        // Remove the flushed text from the buffer
        buffer = buffer.slice(lastBoundaryIndex + 1);
      }
    }

    // After the stream ends, flush any remaining text in the buffer
    if (buffer.length > 0) {
      const normalizedText = buffer.replace(/\s+/g, " ");
      res.write(`data: ${normalizedText}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("❌ Stream error:", err);
    res.write(`data: [ERROR] ${err.message}\n\n`);
    res.end();
  }
};
