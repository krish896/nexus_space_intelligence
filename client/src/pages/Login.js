import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { playClick } from "../utils/audio";

const Login = () => {
  const { login } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleLoginClick = () => {
    playClick();
    setChecking(true);

    // Poll silently until the server is ready, then auto-redirect
    const pollUntilReady = async () => {
      try {
        await fetch("/", {
          method: "GET",
          signal: AbortSignal.timeout(3000),
        });
        // Server responded — auto-trigger OAuth redirect
        login();
      } catch {
        // Not ready yet — retry in 2 seconds silently
        setTimeout(pollUntilReady, 2000);
      }
    };

    pollUntilReady();
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <div className="scanlines"></div>
      <div className="sci-fi-panel fade-in" style={{
        maxWidth: "480px",
        textAlign: "center",
      }}>
        {/* Glow effect */}
        <div style={{
          position: "absolute",
          top: "-50px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "150px",
          height: "150px",
          background: "var(--accent-cyan)",
          filter: "blur(80px)",
          opacity: 0.15,
          zIndex: 0
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <img 
            src="/favicon.png" 
            alt="NEXUS" 
            style={{ height: "64px", marginBottom: "1rem", filter: "drop-shadow(0 0 10px #00f3ff)" }} 
          />

          <div style={{ marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "6px", textShadow: "var(--accent-glow)" }}>NEXUS</span>
          </div>
          <div style={{ fontSize: "0.7rem", color: "rgba(0,243,255,0.6)", letterSpacing: "4px", fontFamily: "Share Tech Mono", marginBottom: "2rem" }}>
            SPACE INTELLIGENCE HUB
          </div>

          <p style={{ marginBottom: "2rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: "1.6", fontFamily: "Share Tech Mono", letterSpacing: "1px" }}>
            AUTHENTICATION REQUIRED TO ACCESS ORBITAL SYSTEMS.
          </p>

          <button 
            className="sci-fi-btn" 
            onClick={handleLoginClick}
            disabled={checking}
            style={{ padding: "0.9rem 2.5rem", opacity: checking ? 0.7 : 1, cursor: checking ? "wait" : "pointer", minWidth: "260px" }}
          >
            {checking ? (
              <>
                <i className="material-icons" style={{ marginRight: "10px", animation: "spin 1s linear infinite" }}>sync</i>
                ESTABLISHING UPLINK...
              </>
            ) : (
              <>
                <i className="material-icons" style={{ marginRight: "10px" }}>login</i>
                SIGN IN WITH GOOGLE
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
