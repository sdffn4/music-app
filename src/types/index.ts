export type TrackType = {
  id: string;
  title: string;
  artist: string;
  album: string;
  source: string;
  cover?: {
    source: string;
    dominantColor: string;
  } | null;
};

export type PlaylistType = {
  id: string;
  title: string;
  description: string;
  cover?: {
    source: string;
    dominantColor: string;
  } | null;
};
