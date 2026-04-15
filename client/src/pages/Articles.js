import React, { useEffect, useState } from "react";
import Centered from "../components/Centered";
import { playSound } from "../utils/audio";

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("https://api.spaceflightnewsapi.net/v4/articles?limit=20");
        const data = await response.json();
        if (data && data.results) {
          setArticles(data.results);
        }
      } catch (err) {
        console.error("News Extraction Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <Centered style={{ padding: "40px" }}>
        <h2 style={{ color: "#00f3ff", fontFamily: "Orbitron" }}>INTERCEPTING SIGNALS...</h2>
        <div className="table-scanline"></div>
      </Centered>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "40px", borderBottom: "2px solid rgba(0,243,255,0.3)", paddingBottom: "10px" }}>
        <h1 style={{ fontFamily: "Orbitron", color: "#00f3ff", margin: 0, textShadow: "0 0 15px rgba(0, 243, 255, 0.5)" }}>
          GLOBAL INTEL FEED
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "10px" }}>
          &gt; LIVE DECRYPTION FROM EXTERNAL AGENCY DATABANKS
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "30px"
      }}>
        {articles.length === 0 ? (
          <h3 style={{ color: "#ff3333" }}>CONNECTION TO NETWORK SEVERED.</h3>
        ) : (
          articles.map((article) => (
            <a 
              key={article.id} 
              href={article.url} 
              target="_blank" 
              rel="noreferrer"
              onClick={() => playSound("success")}
              className="sci-fi-panel fade-in"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "0",
                textDecoration: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
                overflow: "hidden",
                borderLeft: "4px solid #00f3ff"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(0, 243, 255, 0.4)";
                playSound("click");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "inset 0 0 20px rgba(0, 243, 255, 0.2), 0 0 15px rgba(0, 243, 255, 0.3)";
              }}
            >
              {/* Image Banner */}
              <div style={{
                height: "180px",
                backgroundImage: `url(${article.image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderBottom: "1px solid rgba(0, 243, 255, 0.5)"
              }}>
                <div style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "15px"
                }}>
                  <span style={{
                    background: "var(--accent-cyan)",
                    color: "#000",
                    padding: "4px 8px",
                    fontFamily: "Orbitron",
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                    textTransform: "uppercase"
                  }}>
                    {article.news_site}
                  </span>
                </div>
              </div>

              {/* Text Context */}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginBottom: "10px" }}>
                  LOGGED: {new Date(article.published_at).toLocaleDateString()}
                </span>
                
                <h3 style={{ color: "#fff", fontSize: "1.1rem", textTransform: "none", letterSpacing: "1px", marginBottom: "15px", lineHeight: "1.4" }}>
                  {article.title}
                </h3>
                
                <p style={{ color: "#aaeebb", fontSize: "0.9rem", flexGrow: 1 }}>
                  {article.summary.substring(0, 150)}...
                </p>
                
                <div style={{ marginTop: "15px", color: "#00f3ff", fontFamily: "Orbitron", fontSize: "0.85rem", textAlign: "right" }}>
                  INITIATE UPLINK &gt;&gt;
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
};

export default Articles;
