import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { playClick } from "../utils/audio";

const Upcoming = props => {
  const { 
    launches,
    abortLaunch,
  } = props;

  const [filterType, setFilterType] = useState("ALL");

  const tableBody = useMemo(() => {
    return launches
      ?.filter((launch) => {
        if (!launch.upcoming) return false;
        // Guard against stale API data — don't show past launches as upcoming
        const launchDate = new Date(launch.launchDate);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return launchDate >= sevenDaysAgo;
      })
      .filter((launch) => {
        if (filterType === "ALL") return true;
        const agency = launch.agency || "SpaceX";
        return agency === filterType;
      })
      .map((launch) => {
        const hasTarget = launch.target && launch.target !== "N/A" && launch.target !== "";
        const agency = launch.agency || "SpaceX";
        return <tr key={String(launch.flightNumber)}>
          <td>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {agency === "CUSTOM" ? (
                <>
                  <span 
                    className="sci-fi-btn btn-alert"
                    style={{ padding: "0.25rem 0.75rem", fontSize: "0.85rem", display: "inline-block" }}
                    onClick={() => { playClick(); abortLaunch(launch.flightNumber); }}
                    title="Abort Mission"
                  >
                    ABORT
                  </span>
                  {hasTarget && (
                    <Link
                      to={`/exoplanets?simulate=${encodeURIComponent(launch.target)}&rocket=${encodeURIComponent(launch.rocket)}`}
                      className="sci-fi-btn"
                      onClick={playClick}
                      style={{ padding: "0.25rem 0.75rem", fontSize: "0.85rem", display: "inline-block", textDecoration: "none" }}
                    >
                      SIMULATE
                    </Link>
                  )}
                </>
              ) : (
                <span style={{
                  padding: "3px 10px",
                  fontSize: "11px",
                  fontFamily: "Share Tech Mono",
                  color: "#ffaa00",
                  border: "1px solid rgba(255,170,0,0.4)",
                  background: "rgba(255,170,0,0.08)",
                  letterSpacing: "1px",
                }}>
                  SCHEDULED
                </span>
              )}
            </div>
          </td>
          <td>{new Date(launch.launchDate).toDateString()}</td>
          <td>{launch.mission}</td>
          <td>{launch.rocket}</td>
          <td>
            <span style={{ padding: "2px 6px", background: "rgba(0,243,255,0.1)", border: "1px solid rgba(0,243,255,0.4)", fontSize: "11px", fontFamily: "Share Tech Mono" }}>
              {agency}
            </span>
          </td>
        </tr>;
      });
  }, [launches, abortLaunch, filterType]);

  return <div id="upcoming" className="sci-fi-panel fade-in" style={{ marginTop: "2rem" }}>
    <h2>Active Registry</h2>
    <p>&gt; DOWNLOADING UPCOMING MISSIONS INCLUDING SPACEX LOGS...</p>
    <p style={{ color: "var(--text-alert)", fontSize: "0.85rem", fontWeight: "700", letterSpacing: "1px" }}>
      WARNING: EXECUTING 'ABORT' WILL TERMINATE LAUNCH SEQUENCE IMMEDIATELY.
    </p>

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
      <h3 style={{ margin: 0, color: "#00f3ff", fontFamily: "Orbitron" }}>MISSION REGISTRY</h3>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontFamily: "Share Tech Mono", fontSize: "14px", color: "rgba(255, 255, 255, 0.6)" }}>AGENCY FILTER:</span>
        <select 
          value={filterType} 
          onChange={(e) => { playClick(); setFilterType(e.target.value); }}
          style={{ padding: "5px", background: "rgba(0, 20, 20, 0.8)", color: "#00f3ff", border: "1px solid #00f3ff", fontFamily: "Share Tech Mono", cursor: "pointer" }}
        >
          <option value="ALL">ALL AGENCIES</option>
          <option value="SpaceX">SpaceX</option>
          <option value="NASA">NASA</option>
          <option value="ESA">ESA</option>
          <option value="ISRO">ISRO</option>
          <option value="Roscosmos">Roscosmos</option>
          <option value="Blue Origin">Blue Origin</option>
          <option value="Rocket Lab">Rocket Lab</option>
          <option value="CUSTOM">Custom Deep Space</option>
        </select>
      </div>
    </div>
    
    <div style={{ overflowX: "auto", marginTop: "1rem" }}>
      <table style={{ minWidth: "800px" }}>
        <thead>
          <tr>
            <th style={{width: "14rem"}}>ACTION</th>
            <th style={{width: "12rem"}}>DATE</th>
            <th>MISSION</th>
            <th>VEHICLE</th>
            <th style={{width: "9rem"}}>AGENCY</th>
          </tr>
        </thead>
        <tbody>
          {tableBody}
        </tbody>
      </table>
    </div>
  </div>;
}

export default Upcoming;