import axios from "axios";
import { LibraryApi } from "@/pages/api/library";
import { useQuery } from "@tanstack/react-query";

const queryFn = async () => {
  return (await axios.get<LibraryApi>(`/api/library`)).data;
};

const useLibrary = () => {
  return useQuery({
    queryFn,
    queryKey: ["library"],
    staleTime: 1000 * 60,
  });
};

export default useLibrary;
