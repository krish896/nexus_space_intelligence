const Footer = () => {
  return (
    <footer style={{
      textAlign: "center",
      padding: "1.5rem",
      backgroundColor: "rgba(15, 23, 42, 0.8)",
      borderTop: "1px solid var(--glass-border)",
      color: "var(--text-secondary)",
      fontSize: "0.85rem",
      marginTop: "auto"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <p>
          This is not an official site and is not affiliated with NASA or SpaceX
          in any way. For educational purposes only.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
