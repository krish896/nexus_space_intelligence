const Centered = (props) => {
  const { className = "", children, ...rest } = props;
  return (
    <div 
      className={`centered-container ${className}`} 
      style={{
        margin: "0 auto",
        maxWidth: "800px",
        width: "100%"
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Centered;
