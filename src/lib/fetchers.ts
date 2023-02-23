import axios from "axios";

import type { LibraryApi } from "@/pages/api/library";
import type { CreatePlaylistApi } from "@/pages/api/playlist/create";
import { AuthorizeUploadApi } from "@/pages/api/authorize_upload";
import { UploadApiResponse } from "cloudinary";

export const fetchLibrary = async () => {
  return (await axios.get<LibraryApi>(`/api/library`)).data;
};

const uploadImage = async (file: File) => {
  const signData = (
    await axios.post<AuthorizeUploadApi>(`/api/authorize_upload`, {
      folder: "covers",
    })
  ).data;

  const url = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`;

  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", signData.api_key);
  formData.append("timestamp", signData.timestamp);
  formData.append("signature", signData.signature);
  formData.append("folder", "covers");

  return (await axios.post<UploadApiResponse>(url, formData)).data.secure_url;
};

export const createPlaylist = async (args: {
  id: string;
  title: string;
  file: File | undefined;
}) => {
  const secure_url = args.file ? await uploadImage(args.file) : "";

  return (
    await axios.post<CreatePlaylistApi>(`/api/playlist/create`, {
      id: args.id,
      title: args.title,
      cover: secure_url,
    })
  ).data;
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
