import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const flightNumber = req.query.flightNumber;
  if (typeof flightNumber !== "string" || !flightNumber) {
    return res.status(400).json({ error: "Missing flightNumber query parameter" });
  }

  const apiKey = process.env.FLIGHT_API_KEY;
  if (!apiKey) {
    return res.status(502).json({ error: "Flight API key not configured" });
  }

  try {
    const url = `https://api.aviationstack.com/v1/flights?access_key=${encodeURIComponent(apiKey)}&flight_iata=${encodeURIComponent(flightNumber)}`;
    const upstream = await fetch(url);

    if (!upstream.ok) {
      return res.status(502).json({ error: "Upstream API error", status: upstream.status });
    }

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch {
    return res.status(502).json({ error: "Failed to reach upstream API" });
  }
}
