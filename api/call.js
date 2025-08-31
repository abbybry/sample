export default function handler(req, res) {
  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(`
    <Response>
      <Say voice="alice">Hi, you’re speaking with the AI receptionist. Please say something after the beep.</Say>
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
