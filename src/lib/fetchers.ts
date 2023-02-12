import type {
  CreatePlaylistApiResponse,
  GetTrackPlaylistPresenseApiResponse,
  LibraryApiResponse,
} from "@/types/api";
import axios from "axios";

export const fetchLibrary = async () => {
  return (await axios.get<LibraryApiResponse>(`/api/library`)).data;
};

export const createPlaylist = async (args: {
  title: string;
  description: string;
}) => {
  return (
    await axios.post<CreatePlaylistApiResponse>(`/api/playlist/create`, args)
  ).data;
};

export const removePlaylist = async (args: { playlistId: string }) => {
  return await axios.post(`/api/playlist/remove`, args);
};

export const addTrackToPlaylist = async (args: {
  playlistId: string;
  trackId: string;
}) => {
  return await axios.post(`/api/track/add`, args);
};

export const removeTrackFromPlaylist = async (args: {
  playlistId: string;
  trackId: string;
}) => {
  return await axios.post(`/api/track/remove`, args);
};

export const subscribeToPlaylist = async (args: { playlistId: string }) => {
  return await axios.post(`/api/playlist/subscribe`, args);
};

export const unsubscribeFromPlaylist = async (args: {
  subscriptionId: string;
}) => {
  return await axios.post(`/api/playlist/unsubscribe`, args);
};

export const getTrackPlaylistPresense = async () => {
  return (
    await axios.get<GetTrackPlaylistPresenseApiResponse>(
      `/api/track-playlist-presense`
    )
  ).data;
};
