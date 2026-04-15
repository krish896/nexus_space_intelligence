import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { playClick } from "../utils/audio";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <header className="fade-in" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      height: "80px",
      background: "rgba(0, 5, 10, 0.85)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--accent-cyan)",
      boxShadow: "0 0 20px rgba(0, 243, 255, 0.2)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
    }}>
      <Link to="/" onClick={playClick} style={{textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem"}}>
        <img src="/favicon.png" alt="NASA Logo" style={{ height: "40px", filter: "drop-shadow(0 0 8px rgba(0, 243, 255, 0.8))" }} />
        <span style={{ display: "flex", flexDirection: "column", lineHeight: "1.1" }}>
          <span style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "4px", textShadow: "var(--accent-glow)" }}>NEXUS</span>
          <span style={{ fontSize: "0.55rem", color: "rgba(0,243,255,0.6)", letterSpacing: "3px", fontFamily: "Share Tech Mono" }}>SPACE INTELLIGENCE HUB</span>
        </span>
      </Link>
      
      <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link className={`hud-link ${isActive('/launch')}`} to="/launch" onClick={playClick} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isActive('/launch') ? "#fff" : "var(--accent-cyan)" }}>
          <i className="material-icons">rocket_launch</i>
          <span>Launch</span>
        </Link>
        <Link className={`hud-link ${isActive('/upcoming')}`} to="/upcoming" onClick={playClick} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isActive('/upcoming') ? "#fff" : "var(--accent-cyan)" }}>
          <i className="material-icons">update</i>
          <span>Upcoming</span>
        </Link>
        <Link className={`hud-link ${isActive('/history')}`} to="/history" onClick={playClick} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isActive('/history') ? "#fff" : "var(--accent-cyan)" }}>
          <i className="material-icons">history</i>
          <span>History</span>
        </Link>
        <Link className={`hud-link ${isActive('/articles')}`} to="/articles" onClick={playClick} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isActive('/articles') ? "#fff" : "var(--accent-cyan)" }}>
          <i className="material-icons">radar</i>
          <span>Intel</span>
        </Link>
        <Link className={`hud-link ${isActive('/exoplanets')}`} to="/exoplanets" onClick={playClick} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: isActive('/exoplanets') ? "#fff" : "var(--accent-cyan)" }}>
          <i className="material-icons">public</i>
          <span>Star Map</span>
        </Link>
        {user && (
          <div className="hud-link" onClick={() => { playClick(); logout(); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-alert)" }}>
            <i className="material-icons">logout</i>
            <span>Logout</span>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;