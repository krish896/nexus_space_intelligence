const axios = require("axios");

const launchesDB = require("./launches.mongo");
const planets = require("./planets.mongo");

// const { response } = require("../app");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v5/launches/query";
// const launches = new Map(); //this is a state

// let latestflightNumber = 100; //2nd state

async function populateLaunches() {
  console.log("downloading launch data...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers: customers,
      agency: "SpaceX",
      launchPad: launchDoc["launchpad"] || "Unknown",
      sourceId: launchDoc["id"] || String(launchDoc["flight_number"]),
    };
    await saveLaunch(launch);
  }
}

// Agency IDs in Launch Library 2:
// NASA=44, ESA=27, ISRO=31, Roscosmos=63, Blue Origin=141, Rocket Lab=147
const LL2_AGENCIES = [
  { id: 44,  name: "NASA" },
  { id: 27,  name: "ESA" },
  { id: 31,  name: "ISRO" },
  { id: 63,  name: "Roscosmos" },
  { id: 141, name: "Blue Origin" },
  { id: 147, name: "Rocket Lab" },
];

const LL2_BASE = "https://lldev.thespacedevs.com/2.2.0";

async function populateAgencyLaunches() {
  console.log("Downloading multi-agency launch data from Launch Library 2...");
  
  // Resume counter from highest existing LL2 number (>= 10000) to prevent collisions on restart
  const highestLL2 = await launchesDB
    .findOne({ flightNumber: { $gte: 10000 } })
    .sort("-flightNumber");
  let ll2FlightCounter = highestLL2 ? highestLL2.flightNumber + 1 : 10000;
  console.log(`[LL2] Flight counter resuming from: ${ll2FlightCounter}`);


  for (const agency of LL2_AGENCIES) {
    try {
      // Fetch past launches
      const pastRes = await axios.get(`${LL2_BASE}/launch/previous/`, {
        params: {
          lsp__id: agency.id,
          limit: 100,
          ordering: "-net",
          format: "json",
        },
        headers: { "User-Agent": "NASA-Mission-Control/2.0" },
        timeout: 20000,
      });

      // Fetch upcoming launches
      const upcomingRes = await axios.get(`${LL2_BASE}/launch/upcoming/`, {
        params: {
          lsp__id: agency.id,
          limit: 20,
          format: "json",
        },
        headers: { "User-Agent": "NASA-Mission-Control/2.0" },
        timeout: 20000,
      });

      const allDocs = [
        ...(pastRes.data.results || []),
        ...(upcomingRes.data.results || []),
      ];

      for (const doc of allDocs) {
        const launchDate = new Date(doc.net || doc.window_start);
        const isUpcoming = doc.status?.abbrev === "Go" || launchDate > new Date();
        const isSuccess = doc.status?.abbrev === "Success" ? true
                        : doc.status?.abbrev === "Failure" ? false
                        : null;

        const existing = await launchesDB.findOne({ sourceId: doc.id });
        if (existing) {
          // Always sync status — past launches must not stay "upcoming"
          await launchesDB.findOneAndUpdate(
            { sourceId: doc.id },
            { upcoming: isUpcoming, success: isSuccess }
          );
          continue;
        }

        const launch = {
          flightNumber: ll2FlightCounter++,
          mission: doc.name || "Unknown Mission",
          rocket: doc.rocket?.configuration?.name || "Unknown Rocket",
          launchDate,
          upcoming: isUpcoming,
          success: isSuccess,
          customers: [agency.name],
          agency: agency.name,
          launchPad: doc.pad?.name || "Unknown Pad",
          sourceId: doc.id,
        };
        await saveLaunch(launch);
      }

      console.log(`[LL2] Loaded ${allDocs.length} launches for ${agency.name}`);
    } catch (err) {
      console.error(`[LL2] Failed to load ${agency.name}:`, err.message);
    }
  }
}

async function loadLaunchData() {
  await populateLaunches();
  await populateAgencyLaunches();
  console.log("All launch data loaded!");
}

async function findLaunch(filter) {
  return await launchesDB.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  // return launches.has(launchId);
  return await findLaunch({ flightNumber: launchId });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDB.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values());
  return await launchesDB
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

// this is an internal function not exposed outside to add launches to the system
async function saveLaunch(launch) {
  await launchesDB.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({ keplerName: launch.target });

  if (!planet) {
    throw new Error("No matching planet found");
  }
  latestflightNumber = (await getLatestFlightNumber()) + 1; //incrementing the latest flight number by 1

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["ztm", "nasa"],
    flightNumber: latestflightNumber,
    agency: "CUSTOM",
    sourceId: `custom-${latestflightNumber}`,
  });
  await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
//   latestflightNumber++;
//   launches.set(
//     latestflightNumber,
//     Object.assign(launch, {
//       success: true,
//       upcoming: true,
//       flightNumber: latestflightNumber,
//       customers: ["ztm", "nasa"],
//     })
//   );
// }

async function abortLaunchById(launchId) {
  const aborted = await launchesDB.updateOne(
    { flightNumber: launchId },
    { upcoming: false, success: false }
  );

  return aborted.modifiedCount === 1;

  // // launches.delete(launchId);
  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
}

module.exports = {
  loadLaunchData,
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};
