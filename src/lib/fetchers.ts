import axios from "axios";

import type { LibraryApi } from "@/pages/api/library";
import type { CreatePlaylistApi } from "@/pages/api/playlist/create";

export const fetchLibrary = async () => {
  return (await axios.get<LibraryApi>(`/api/library`)).data;
};

export const createPlaylist = async (args: { id: string; title: string }) => {
  return (await axios.post<CreatePlaylistApi>(`/api/playlist/create`, args))
    .data;
};

export const removePlaylist = async (args: { playlistId: string }) => {
  return (await axios.post(`/api/playlist/remove`, args)).data;
};

export const addTrackToPlaylist = async (args: {
  playlistId: string;
  trackId: string;
}) => {
  return (await axios.post(`/api/track/add`, args)).data;
};

export const removeTracksFromPlaylist = async (args: {
  playlistId: string;
  tracks: string[];
}) => {
  return (await axios.post(`/api/track/remove`, args)).data;
};

export const subscribeToPlaylist = async (args: {
  id: string;
  playlistId: string;
  title: string;
}) => {
  return (await axios.post(`/api/playlist/subscribe`, args)).data;
};

export const unsubscribeFromPlaylist = async (args: {
  subscriptionId: string;
}) => {
  return (await axios.post(`/api/playlist/unsubscribe`, args)).data;
};
