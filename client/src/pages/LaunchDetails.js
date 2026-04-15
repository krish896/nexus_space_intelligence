import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { httpGetLaunchDetails } from "../hooks/requests";
import Centered from "../components/Centered";
import { playSound } from "../utils/audio";

const LaunchDetails = () => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const data = await httpGetLaunchDetails(id);
      setDetails(data);
      setLoading(false);
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <Centered style={{ padding: "40px" }}>
        <h2 style={{ color: "#00f3ff", fontFamily: "Orbitron" }}>DECRYPTING DATABANKS...</h2>
        <div className="table-scanline"></div>
      </Centered>
    );
  }

  if (!details) {
    return (
      <Centered style={{ padding: "40px" }}>
        <h2 style={{ color: "#ff3333", fontFamily: "Orbitron" }}>ERROR: LOG NOT FOUND</h2>
        <Link to="/history" className="history-link" onClick={() => playSound("click")}>
          &lt; RETURN TO ARCHIVES
        </Link>
      </Centered>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ fontFamily: "Orbitron", color: "#00f3ff", textTransform: "uppercase", margin: 0, letterSpacing: "2px" }}>
          MISSION: {details.mission}
        </h1>
        <Link 
          to="/history" 
          onClick={() => playSound("click")}
          style={{
            color: "#ff3333",
            fontFamily: "Share Tech Mono",
            textDecoration: "none",
            borderBottom: "1px solid #ff3333",
            paddingBottom: "2px",
            fontSize: "14px",
            letterSpacing: "1px"
          }}
        >
          &lt; ABORT VIEW
        </Link>
      </div>

      <div className="sci-fi-panel fade-in" style={{ marginBottom: "30px", borderLeft: "4px solid #00f3ff" }}>
        <h3 style={{ fontFamily: "Orbitron", color: "#fff", borderBottom: "1px solid rgba(0,243,255,0.3)", paddingBottom: "10px" }}>
          FLIGHT REFERENCE: #{details.flightNumber}
        </h3>
        
        <div style={{ marginTop: "20px" }}>
          <strong style={{ color: "#00f3ff" }}>PERSONNEL & AGENCIES INVESTED:</strong>
          <ul style={{ listStyleType: "square", color: "#fff", marginTop: "10px", paddingLeft: "20px" }}>
            {details.personnel && details.personnel.length > 0 ? (
              details.personnel.map((p, i) => <li key={i}>{p}</li>)
            ) : (
              <li>CLASSIFIED / UNKNOWN</li>
            )}
          </ul>
        </div>

        <div style={{ marginTop: "20px" }}>
          <strong style={{ color: "#00f3ff" }}>HARDWARE SPECS:</strong>
          <ul style={{ listStyleType: "square", color: "#fff", marginTop: "10px", paddingLeft: "20px" }}>
            <li><strong>ROCKET CLASS:</strong> {details.rocketClass || "Unknown"}</li>
            <li><strong>LAUNCHPAD:</strong> {details.launchpad || "Unclassified Region"}</li>
          </ul>
        </div>

        {details.webcast && (
          <div style={{ marginTop: "20px" }}>
            <a href={details.webcast} target="_blank" rel="noreferrer" style={{color: "#ffaa00", textDecoration: "none", borderBottom: "1px dashed #ffaa00"}}>
              &gt; VIEW SECURE MISSION WEBCAST RECORDING
            </a>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* WIKI EXTRACT */}
        <div className="sci-fi-panel fade-in" style={{ borderTop: "4px solid #fff" }}>
          <h3 style={{ fontFamily: "Orbitron", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "10px" }}>
            HISTORICAL RECORD
          </h3>
          <p style={{ color: "#d3d3d3", lineHeight: "1.6", fontSize: "14px", marginTop: "15px" }}>
            {details.wikipediaSummary || "No historical extraction parameter found in Earth databanks."}
          </p>
        </div>

        {/* OUTCOMES & FAILURES */}
        <div className="sci-fi-panel fade-in" style={{ borderTop: "4px solid #ffaa00" }}>
          <h3 style={{ fontFamily: "Orbitron", color: "#ffaa00", borderBottom: "1px solid rgba(255,170,0,0.3)", paddingBottom: "10px" }}>
            OUTCOMES & ANALYSIS
          </h3>
          <p style={{ color: "#fff", fontStyle: "italic", fontSize: "15px", marginTop: "15px" }}>
            "{details.outcomes || "Pending status."}"
          </p>

          <h4 style={{ fontFamily: "Orbitron", color: "#fff", marginTop: "25px", fontSize: "14px" }}>
            TELEMETRY TIMELINE
          </h4>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", marginTop: "10px", border: "1px solid #333" }}>
            {details.timeline && details.timeline.length > 0 ? (
              details.timeline.map((event, i) => (
                <div key={i} style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "8px 0" }}>
                  <span style={{ color: "#00f3ff", width: "80px" }}>T+{event.time}s</span>
                  <span style={{ color: "#fff" }}>{event.reason.toUpperCase()}</span>
                </div>
              ))
            ) : (
              <span style={{ color: "#555" }}>NO TELEMETRY FAILURES LOGGED.</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LaunchDetails;
