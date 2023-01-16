export type TrackType = {
  id: string;
  title: string;
  artist: string;
  album: string;
  source: string;
  cover: {
    source: string | null;
    dominant: string;
  };
};
