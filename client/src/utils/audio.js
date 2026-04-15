export const playSound = (src) => {
  const audio = new Audio(src);
  audio.volume = 0.5;
  audio.play().catch(e => console.log('Audio disabled by browser policy'));
};

export const playClick = () => playSound('/sound/click.mp3');
export const playTyping = () => playSound('/sound/typing.mp3');
export const playDeploy = () => playSound('/sound/deploy.mp3');
export const playSuccess = () => playSound('/sound/success.mp3');
export const playAbort = () => playSound('/sound/abort.mp3');
export const playWarning = () => playSound('/sound/warning.mp3');
