import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // Twilio sends us the recording URL after caller speaks
    const recordingUrl = req.body.RecordingUrl;

    // 1. Download audio file from Twilio
    const audioResponse = await fetch(`${recordingUrl}.wav`);
    const audioBuffer = await audioResponse.arrayBuffer();

    // 2. Send audio to OpenAI Speech-to-Text
    const sttResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: (() => {
        const formData = new FormData();
        formData.append("file", new Blob([audioBuffer]), "audio.wav");
        formData.append("model", "gpt-4o-mini-transcribe");
        return formData;
      })(),
    });

    const sttData = await sttResponse.json();
    const userText = sttData.text || "Hello?";

    // 3. Get AI response from OpenAI LLM
    const llmResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: `The caller said: "${userText}". Respond as a friendly receptionist.`,
      }),
    });

    const llmData = await llmResponse.json();
    const replyText = llmData.output[0].content[0].text;

    // 4. Convert reply to voice with ElevenLabs
    const elevenResponse = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL", // default voice
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: replyText,
          voice_settings: { stability: 0.4, similarity_boost: 0.8 },
        }),
      }
    );

    const audioStream = await elevenResponse.arrayBuffer();

    // 5. Respond to Twilio with audio
    res.setHeader("Content-Type", "text/xml");
    res.status(200).send(`
      <Response>
        <Play>data:audio/mpeg;base64,${Buffer.from(audioStream).toString("base64")}</Play>
      </Response>
    `);
  } catch (err) {
    console.error(err);
    res.setHeader("Content-Type", "text/xml");
    res.status(200).send(`
      <Response>
        <Say voice="alice">Sorry, something went wrong.</Say>
      </Response>
    `);
  }
}
