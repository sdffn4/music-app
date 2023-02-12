import { PlaylistType } from ".";

interface Playlist {
  id: string;
  title: string;
}

export type LibraryApiResponse = {
  playlists: Array<Playlist>;
  subscriptions: Array<{ id: string; playlist: Playlist }>;
};

export type CreatePlaylistApiResponse = PlaylistType;

export interface RemovePlaylistApiResponse {
  id: string;
}

export interface GetTrackPlaylistPresenseApiResponse {
  playlists: Array<{
    tracks: Array<string>;
    id: string;
    title: string;
  }>;
}
