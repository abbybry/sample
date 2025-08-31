export default function handler(req, res) {
  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(`
    <Response>
      <Say voice="alice">Hello! This is your AI receptionist test. The system is working.</Say>
    </Response>
  `);
}
