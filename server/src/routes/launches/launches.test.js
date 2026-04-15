process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets.model");

describe("Launches API", () => {
  // runs once before all tests in this block
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  // runs once after all tests in this block
  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
      // expect(response.statusCode).toBe(200);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "January 4, 2028",
    };

    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
    };

    const launchDataWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "zoot",
    };

    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
      // here it is partially matching the object the response body has a launchDate property but it is being tested separately and ignored here
    });

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });

    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
/**
 * ----------------------------
 * Explanation: How Express Route Testing Works
 * ----------------------------
 *
 * 1. describe() blocks:
 *    - Used to group related tests together (e.g., all GET /launches tests).
 *    - This improves readability but does not affect how tests run.
 *
 * 2. test() blocks:
 *    - Each test() contains a single test case.
 *    - Tests should focus on one behavior at a time.
 *
 * 3. Testing Express routes with Supertest:
 *    - We import our Express "app" (NOT server.js).
 *        const app = require('../../app');
 *
 *    - Supertest uses request(app) to simulate HTTP requests:
 *        request(app).get('/launches')
 *        request(app).post('/launches').send({...})
 *
 *    - IMPORTANT: Supertest does NOT start a real HTTP server.
 *      It injects fake requests directly into Express’s internal
 *      request handler (app.handle()), avoiding ports & networking.
 *
 * 4. Why API responses return ISO date strings:
 *    - JSON does not support Date objects.
 *    - When Express sends JSON, all Date objects are automatically
 *      converted to ISO 8601 strings (e.g. "2028-01-04T00:00:00.000Z").
 *    - This format is universal, unambiguous, and used by all major APIs.
 *
 * 5. Why we do NOT compare date strings directly in tests:
 *    - The input string ("January 4, 2028") and output ISO string
 *      ("2028-01-04T00:00:00.000Z") will never match text-wise.
 *
 *    - Dates may differ in:
 *         * timezone format
 *         * milliseconds
 *         * locale formatting
 *
 *      so string comparison is unreliable.
 *
 * 6. Correct way to compare dates in tests:
 *      - Convert BOTH the request date and response date into
 *        timestamps (numeric values).
 *
 *        Example:
 *          const requestDate = new Date(launchDate).valueOf();
 *          const responseDate = new Date(response.body.launchDate).valueOf();
 *          expect(responseDate).toBe(requestDate);
 *
 *    - valueOf() returns the number of milliseconds since Jan 1, 1970 UTC.
 *      If two timestamps match, the dates represent the SAME moment in time.
 *
 * 7. Why timestamp comparison is the best approach:
 *      - Ignores formatting differences
 *      - Ignores timezone offsets
 *      - Ignores string ambiguity
 *      - Works the same in all environments
 *
 * 8. Summary of the testing flow:
 *      request(app)                 → simulate HTTP request
 *      .get/post(...)               → hit route
 *      .expect(...)                 → check status & headers
 *      response                     → returned JSON
 *
 *      Convert dates → compare timestamps → ensure logic is correct.
 *
 * ----------------------------
 * End of explanation
 * ----------------------------
 */
