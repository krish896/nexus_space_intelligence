import {
  BrowserRouter as Router,
} from "react-router-dom";


import AppLayout from "./pages/AppLayout";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import SpaceCanvas from "./components/SpaceCanvas";



const AppContent = () => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1rem" }}>
      <div style={{ fontSize: "1.8rem", fontWeight: "900", letterSpacing: "6px", color: "#00f3ff", textShadow: "0 0 20px rgba(0,243,255,0.8)" }}>NEXUS</div>
      <div style={{ fontFamily: "Share Tech Mono", fontSize: "0.75rem", color: "rgba(0,243,255,0.6)", letterSpacing: "3px" }}>ESTABLISHING SECURE LINK...</div>
      <div style={{ width: "120px", height: "2px", background: "rgba(0,243,255,0.15)", marginTop: "0.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", height: "100%", width: "40%", background: "#00f3ff", boxShadow: "0 0 10px #00f3ff", animation: "scanBar 1.2s ease-in-out infinite" }} />
      </div>
    </div>
  );
  if (!user) return <Login />;
  
  return <AppLayout />;
};

const App = () => {
  return (
    <>
      <SpaceCanvas />
      <div style={{ minHeight: "100vh" }}>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </div>
    </>
  );
};

export default App;
