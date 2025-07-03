// services/safeBrowsingAPI.js
import axios from "axios";

const GOOGLE_API_KEY = "AIzaSyDSHcCcH5TAzUcrrEgta9dho_n3OIg-JQw";
const URLSCAN_API_KEY = ""; // ← optional nếu muốn dùng key riêng

export async function checkGoogleSafeBrowsing(domain) {
  const urlToCheck = `http://${domain}`;
  const requestBody = {
    client: {
      clientId: "trust-checker",
      clientVersion: "1.0",
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url: urlToCheck }],
    },
  };

  try {
    const [safeBrowsingRes, urlscanRes] = await Promise.all([
      axios.post(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`,
        requestBody
      ),
      axios.post(
        "https://urlscan.io/api/v1/scan/",
        { url: urlToCheck },
        {
          headers: {
            "Content-Type": "application/json",
            ...(URLSCAN_API_KEY && { "API-Key": URLSCAN_API_KEY }),
          },
        }
      ),
    ]);

    const resultUrl = urlscanRes?.data?.result;

    if (safeBrowsingRes.data && safeBrowsingRes.data.matches) {
      return {
        isSafe: false,
        threats: safeBrowsingRes.data.matches.map((m) => m.threatType),
        urlscan: { resultUrl },
      };
    } else {
      return {
        isSafe: true,
        threats: [],
        urlscan: { resultUrl },
      };
    }
  } catch (error) {
    console.error("Safe Browsing error:", error);
    return { isSafe: null, error: error.message };
  }
}
