import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { GetPlaylistsApi } from "@/pages/api/get_playlists";

const fetcher = async () => {
  return (await axios.get<GetPlaylistsApi>(`/api/get_playlists`)).data;
};

const useGetPlaylists = () => {
  return useQuery({ queryFn: fetcher, queryKey: ["index"] });
};

export default useGetPlaylists;
