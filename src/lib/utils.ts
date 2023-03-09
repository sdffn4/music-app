export const formatDuration = (duration: number) => {
  const minutes = Math.round(duration / 60);
  const seconds = Math.round(duration % 60);

  return `${minutes < 10 ? `0${minutes}` : minutes}:${
    seconds < 10 ? `0${seconds}` : seconds
  }`;
};
