import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { playSound } from "../utils/audio";

const AGENCIES = ["ALL", "SpaceX", "NASA", "ESA", "ISRO", "Roscosmos", "Blue Origin", "Rocket Lab", "CUSTOM"];

const AGENCY_COLORS = {
  SpaceX:       "#aaaaaa",
  NASA:         "#0057a8",
  ESA:          "#ffcc00",
  ISRO:         "#ff9900",
  Roscosmos:    "#cc0000",
  "Blue Origin":"#1a7fc1",
  "Rocket Lab": "#ff2200",
  CUSTOM:       "#00f3ff",
};

const History = props => {
  const [agencyFilter, setAgencyFilter] = useState("ALL");

  const tableBody = useMemo(() => {
    return props.launches
      ?.filter((launch) => !launch.upcoming)
      .filter((launch) => {
        if (agencyFilter === "ALL") return true;
        return (launch.agency || "SpaceX") === agencyFilter;
      })
      .map((launch) => {
        const agency = launch.agency || "SpaceX";
        const agencyColor = AGENCY_COLORS[agency] || "#ffffff";

        return <tr key={String(launch.flightNumber)}>
          <td>
            <span style={{
              display: "inline-block",
              width: "12px",
              height: "12px",
              backgroundColor: launch.success === true ? "#00ff00"
                             : launch.success === false ? "var(--text-alert)"
                             : "#ffaa00",
              boxShadow: `0 0 10px ${launch.success === true ? "#00ff00"
                        : launch.success === false ? "var(--text-alert)"
                        : "#ffaa00"}`,
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
            }}></span>
          </td>
          <td>
            <span style={{
              padding: "2px 8px",
              background: agencyColor + "22",
              border: `1px solid ${agencyColor}`,
              color: agencyColor,
              fontSize: "11px",
              fontFamily: "Share Tech Mono",
              borderRadius: "2px",
              letterSpacing: "1px",
            }}>
              {agency}
            </span>
          </td>
          <td>{new Date(launch.launchDate).toDateString()}</td>
          <td>
            <Link
              to={`/history/${launch.flightNumber}`}
              onClick={() => playSound("click")}
              style={{
                color: "#00f3ff",
                textDecoration: "none",
                borderBottom: "1px dashed rgba(0, 243, 255, 0.4)",
              }}
            >
              {launch.mission}
            </Link>
          </td>
          <td>{launch.rocket}</td>
          <td style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
            {launch.launchPad || "—"}
          </td>
        </tr>;
      });
  }, [props.launches, agencyFilter]);

  return <div id="history" className="sci-fi-panel fade-in" style={{ marginTop: "2rem" }}>
    <h2>Mission Archive</h2>
    <p>&gt; DECRYPTING FLIGHT LOGS FROM ALL AGENCIES.</p>

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
      <h3 style={{ margin: 0, color: "#00f3ff", fontFamily: "Orbitron" }}>LAUNCH RECORD</h3>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontFamily: "Share Tech Mono", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>AGENCY:</span>
        <select
          value={agencyFilter}
          onChange={(e) => { playSound("click"); setAgencyFilter(e.target.value); }}
          style={{ padding: "5px", background: "rgba(0,20,20,0.8)", color: "#00f3ff", border: "1px solid #00f3ff", fontFamily: "Share Tech Mono", cursor: "pointer" }}
        >
          {AGENCIES.map(a => <option key={a} value={a}>{a === "ALL" ? "ALL AGENCIES" : a}</option>)}
        </select>
      </div>
    </div>
    
    <div style={{ overflowX: "auto", marginTop: "1rem" }}>
      <table style={{ minWidth: "900px" }}>
        <thead>
          <tr>
            <th style={{width: "4rem"}}>STAT</th>
            <th style={{width: "10rem"}}>AGENCY</th>
            <th style={{width: "12rem"}}>DATE</th>
            <th>MISSION</th>
            <th style={{width: "10rem"}}>VEHICLE</th>
            <th style={{width: "12rem"}}>LAUNCH PAD</th>
          </tr>
        </thead>
        <tbody>
          {tableBody}
        </tbody>
      </table>
    </div>
  </div>;
}

export default History;