export default function handler(req, res) {
  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(`
    <Response>
      <Play>/greeting.mp3</Play>
      <Record 
        action="/api/response"
        method="POST"
        playBeep="true"
        maxLength="10"
      />
      <Say>I didn’t receive any input. Goodbye!</Say>
    </Response>
  `);
}
