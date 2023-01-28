import { PlaylistType } from ".";

export interface LibraryApiResponse {
  playlists: Array<{ id: string; title: string }>;
}

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
