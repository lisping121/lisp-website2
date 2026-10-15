exports.handler = async (event) => {
  const apiKey = process.env.LISP_API_KEY;
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  if (!apiKey) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: "Missing LISP_API_KEY Netlify environment variable."
      })
    };
  }

  const period = ["weekly", "monthly", "all"].includes(
    event.queryStringParameters?.period
  )
    ? event.queryStringParameters.period
    : "weekly";

  // Use the API base URL documented by CSGOWIN.
  const upstream =
    `https://api.csgowin.com/api/leaderboard/lisp?period=${encodeURIComponent(period)}`;

  try {
    const response = await fetch(upstream, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "x-apikey": apiKey
      }
    });

    const raw = await response.text();
    let payload;

    try {
      payload = JSON.parse(raw);
    } catch {
      payload = {
        error: "CSGOWIN returned non-JSON data.",
        responsePreview: raw.slice(0, 300)
      };
    }

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(payload)
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        error: "Netlify could not reach the CSGOWIN API.",
        details: String(error?.message || error)
      })
    };
  }
};
