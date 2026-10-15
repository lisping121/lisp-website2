exports.handler = async (event) => {
  const apiKey = process.env.LISP_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ error: "Missing LISP_API_KEY Netlify environment variable." }) };
  }
  const period = ["weekly", "monthly", "all"].includes(event.queryStringParameters?.period)
    ? event.queryStringParameters.period : "weekly";
  const upstream = `https://api.csgowin.com/leaderboard/lisp`;
  try {
    const response = await fetch(upstream, {
      method: "GET",
      headers: { "Accept": "application/json", "x-apikey": apiKey }
    });
    const raw = await response.text();
    let payload;
    try { payload = JSON.parse(raw); }
    catch { payload = { error: "CSGOWIN returned non-JSON data.", responsePreview: raw.slice(0, 300) }; }

    // Return upstream status and body so the page can display the real failure reason.
    return {
      statusCode: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify(payload)
    };
  } catch (error) {
    return { statusCode: 502, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ error: "Netlify could not reach the CSGOWIN API.", details: String(error?.message || error) }) };
  }
};
