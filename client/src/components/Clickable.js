const Clickable = props => {
  const {
    children,
    onClick,
    ...rest
  } = props;

  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  return (
    <span {...rest} onClick={handleClick}>
      {children}
    </span>
  );
};

export default Clickable;
