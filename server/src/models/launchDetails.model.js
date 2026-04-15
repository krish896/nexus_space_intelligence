const axios = require("axios");
const launchDetailsDB = require("./launchDetails.mongo");
const launchesDB = require("./launches.mongo");

const SPACEX_API_URL = "https://api.spacexdata.com/v5/launches/query";
const LL2_BASE = "https://lldev.thespacedevs.com/2.2.0";

async function fetchWikipediaSummary(title) {
  try {
    const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      headers: { 'User-Agent': 'NASA-Archiver/1.0 (contact: admin@nasa-project.local)' }
    });
    return response.data.extract || "";
  } catch (err) {
    console.error(`Wikipedia fetch failed for ${title}`, err.message);
    return "";
  }
}

async function extractLL2Details(flightNumber, launch) {
  try {
    const res = await axios.get(`${LL2_BASE}/launch/${launch.sourceId}/`, {
      headers: { "User-Agent": "NASA-Mission-Control/2.0" },
      timeout: 15000,
    });
    const doc = res.data;

    const description = doc.mission?.description || doc.name || "No mission description available.";
    const webcast = doc.vidURLs?.[0]?.url || doc.vidURLs?.[0] || "";
    const missionPatch = doc.image || "";

    const status = doc.status?.name || "Unknown";
    const outcomes = `Status: ${status}. ${doc.failreason || description}`;

    const detailDoc = {
      flightNumber,
      mission: launch.mission,
      agency: launch.agency,
      wikipediaSummary: description,
      outcomes,
      timeline: [{ time: 0, reason: doc.status?.name || "LAUNCH" }],
      personnel: launch.customers || [launch.agency],
      rocketClass: launch.rocket,
      launchpad: launch.launchPad || doc.pad?.name || "Unknown Pad",
      webcast,
      missionPatch,
    };

    await launchDetailsDB.findOneAndUpdate({ flightNumber }, detailDoc, { upsert: true });
    return detailDoc;
  } catch (err) {
    console.error(`LL2 detail fetch failed for ${flightNumber}:`, err.message);
    // Fallback to whatever we have in the launches DB
    return {
      flightNumber,
      mission: launch.mission,
      agency: launch.agency,
      wikipediaSummary: "Mission details temporarily unavailable. Please try again later.",
      outcomes: launch.success === true ? "SUCCESS" : launch.success === false ? "FAILURE" : "SCHEDULED",
      timeline: [{ time: 0, reason: "LAUNCH" }],
      personnel: launch.customers || [launch.agency],
      rocketClass: launch.rocket,
      launchpad: launch.launchPad || "Unknown",
      webcast: "",
    };
  }
}


async function extractLaunchDetails(flightNumber) {
  // First, check if we already extracted and cached it
  const existingDetail = await launchDetailsDB.findOne({ flightNumber });
  if (existingDetail) {
    return existingDetail;
  }

  // Check if it's a valid launch in our system
  const launch = await launchesDB.findOne({ flightNumber });
  if (!launch) {
    throw new Error("Launch not found in primary database.");
  }

  // Route based on agency
  const agency = launch.agency || "SpaceX";

  // Custom user-created missions → return mock
  if (agency === "CUSTOM") {
    const customResult = {
      flightNumber,
      mission: launch.mission,
      agency: "CUSTOM",
      wikipediaSummary: "No Wikipedia entry exists for this classified deep-space mission. Flight parameters and trajectory remain encrypted within the mission core.",
      outcomes: launch.upcoming ? "PENDING DEPLOYMENT" : (launch.success ? "Mission parameters successfully achieved." : "Mission critically aborted."),
      timeline: [{ time: 0, reason: "INITIAL LAUNCH COMMAND EXECUTED" }],
      personnel: launch.customers || ["NASA", "ZTM"]
    };
    await launchDetailsDB.findOneAndUpdate({ flightNumber }, customResult, { upsert: true });
    return customResult;
  }

  // LL2 agency launches → fetch from Launch Library 2 using sourceId
  if (agency !== "SpaceX" && launch.sourceId) {
    return await extractLL2Details(flightNumber, launch);
  }

  // If it's a historical SpaceX flight, extract from the open web!
  let outcomes = "";
  let timeline = [];
  let personnel = launch.customers || [];
  let wikipediaSummary = "Extraction failed. No Wikipedia article documented.";

  try {
    const response = await axios.post(SPACEX_API_URL, {
      query: { flight_number: flightNumber },
      options: {
        pagination: false,
        populate: [
          { path: "payloads", select: { customers: 1 } },
          { path: "crew", select: { name: 1, agency: 1 } },
          { path: "rocket", select: { name: 1 } },
          { path: "launchpad", select: { name: 1, region: 1 } }
        ]
      }
    });

    const doc = response.data.docs[0];
    if (doc) {
      outcomes = doc.details || (doc.success ? "Mission achieved nominal parameters." : "Mission failed. Destructive sequence recorded.");
      
      if (doc.failures && doc.failures.length > 0) {
        timeline = doc.failures.map(f => ({
          time: f.time || 0,
          reason: f.reason || "Unknown anomaly"
        }));
      } else {
        timeline.push({ time: 0, reason: "LIFTOFF" });
      }

      // Add crew to personnel if exist
      if (doc.crew && doc.crew.length > 0) {
        doc.crew.forEach(c => personnel.push(`${c.name} (${c.agency})`));
      }

      const wikiLink = doc.links && doc.links.wikipedia;
      if (wikiLink) {
        // Extract title from wikipedia url
        const titleMatch = wikiLink.match(/wiki\/(.+)$/);
        if (titleMatch && titleMatch[1]) {
          const rawTitle = titleMatch[1];
          wikipediaSummary = await fetchWikipediaSummary(rawTitle);
        }
      }
    }

    const rocketClass = doc?.rocket?.name || launch.rocket || "Unknown Core";
    const launchpad = doc?.launchpad ? `${doc.launchpad.name} (${doc.launchpad.region})` : "Unclassified Region";
    const webcast = doc?.links?.webcast || "";
    
    // Save to DB
    const detailDoc = {
      flightNumber,
      mission: launch.mission,
      wikipediaSummary,
      outcomes,
      timeline,
      personnel,
      rocketClass,
      launchpad,
      webcast
    };

    await launchDetailsDB.findOneAndUpdate({ flightNumber }, detailDoc, { upsert: true });
    return detailDoc;

  } catch (err) {
    console.error(`SpaceX Extraction failed for flight ${flightNumber}`, err.message);
    throw err;
  }
}

module.exports = {
  extractLaunchDetails,
};
