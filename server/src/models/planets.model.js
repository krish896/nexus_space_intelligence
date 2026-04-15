const { parse } = require("csv-parse");
const fs = require("fs");
const { resolve } = require("path");

const planets = require("./planets.mongo");

// const habitablePlanets = [];

function isHabitablePlanet(planet) {
  // fn to filter out inhabitable pla nets
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

async function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream("kepler.csv")
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          await savePlanet(data); // ✅ await
        }
      })
      .on("error", (err) => {
        console.error(err);
        reject(err);
      })
      .on("end", async () => {
        const planetCount = (await getAllPlanets()).length;

        if (process.env.NODE_ENV !== "test") {
          console.log(`${planetCount} habitable planets were found`);
        }

        resolve(); // ✅ now real
      });
  });
}

async function getAllPlanets() {
  // return habitablePlanets;
  return await planets.find({}, { _id: 0, __v: 0 });
  // we dont want to return the _id and __v fields so we exclude them by setting them to 0
}

async function savePlanet(planet) {
  try {
    // insert + update = upsert
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
        ra: Number(planet.ra),
        dec: Number(planet.dec),
      },
      {
        upsert: true,
        // this option will insert the data if it does not already exist
      }
    );
  } catch (err) {
    console.error(`Could not save planet ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  // server will call this every instance of the server and thus duplicating the data so we will have to use upsert in the loadPlanetsData function so that it insert only if the data is not already present
  getAllPlanets,
};
