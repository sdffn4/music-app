export interface LibraryApiResponse {
  playlists: {
    id: string;
    title: string;
    tracks: Array<string>;
  }[];
  subscriptions: {
    id: string;
    playlist: {
      id: string;
      title: string;
    };
  }[];
}

export interface CreatePlaylistApiResponse {
  id: string;
  title: string;
}

export interface RemovePlaylistApiResponse {
  id: string;
}

export interface GetTrackPlaylistPresenseApiResponse {
  playlists: {
    tracks: Array<string>;
    id: string;
    title: string;
  }[];
}
