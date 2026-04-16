import { useMemo, useState, useEffect } from "react";
import { playTyping } from "../utils/audio";

const Launch = (props) => {
  const [selectedPlanet, setSelectedPlanet] = useState("");

  useEffect(() => {
    const cachedTarget = localStorage.getItem("nasa_target_planet");
    if (cachedTarget) {
      setSelectedPlanet(cachedTarget);
      localStorage.removeItem("nasa_target_planet");
    } else if (props.planets && props.planets.length > 0 && !selectedPlanet) {
      setSelectedPlanet(props.planets[0].keplerName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.planets]);

  const selectorBody = useMemo(() => {
    return props.planets?.map((planet) => (
      <option value={planet.keplerName} key={planet.keplerName}>
        {planet.keplerName}
      </option>
    ));
  }, [props.planets]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div id="launch" className="sci-fi-panel fade-in" style={{ marginTop: "2rem" }}>
      <h2>Schedule Mission Route</h2>
      <p>
        SYSTEM PROMPT: SCHEDULE A MISSION LAUNCH FOR INTERSTELLAR TRAVEL TO ONE OF THE KEPLER EXOPLANETS.
      </p>
      <p style={{ color: "var(--text-secondary)" }}>
        &gt; Only confirmed planets matching the thermal/radius criteria are authorized for charting.
      </p>
      <ul style={{ 
        marginLeft: "1.5rem", 
        marginBottom: "2rem",
        color: "var(--text-secondary)",
        fontFamily: "'Share Tech Mono', monospace"
      }}>
        <li style={{ marginBottom: "0.5rem" }}>RADIUS PARAMETER: &lt; 1.6x Earth</li>
        <li>
          STELLAR FLUX PARAMETER: &gt; 0.36x Earth AND &lt; 1.11x Earth
        </li>
      </ul>

      <form
        onSubmit={props.submitLaunch}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gridGap: "1rem 2rem",
          alignItems: "center",
          maxWidth: "800px"
        }}
      >
        <label htmlFor="launch-day">Launch Date</label>
        <input
          type="date"
          id="launch-day"
          name="launch-day"
          min={today}
          max="2040-12-31"
          defaultValue={today}
          onFocus={playTyping}
        />
        
        <label htmlFor="mission-name">Mission Designation</label>
        <input 
          type="text" 
          id="mission-name" 
          name="mission-name" 
          placeholder="e.g. KEPLER DISCOVERY"
          onFocus={playTyping}
        />
        
        <label htmlFor="rocket-name">Vessel Chassis</label>
        <input
          type="text"
          id="rocket-name"
          name="rocket-name"
          defaultValue="Explorer IS1"
          onFocus={playTyping}
        />
        
        <label htmlFor="planets-selector">Target Coordinates</label>
        <select 
          id="planets-selector" 
          name="planets-selector"
          value={selectedPlanet}
          onChange={(e) => setSelectedPlanet(e.target.value)}
          onFocus={playTyping}
        >
          {selectorBody}
        </select>
        
        <div style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
          <button
            type="submit"
            className="sci-fi-btn"
            disabled={props.isPendingLaunch}
            style={{ width: "100%", maxWidth: "300px" }}
          >
            {props.isPendingLaunch ? "INITIALIZING SEQUENCE..." : "ENGAGE LAUNCH"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Launch;
