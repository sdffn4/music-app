import { UploadsApi } from "@/pages/api/uploads";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const queryFn = async () => {
  return (await axios.get<UploadsApi>(`/api/uploads`)).data;
};

const useUploads = () => {
  return useQuery({
    queryFn,
    queryKey: ["uploads"],
    staleTime: 1000 * 60,
  });
};

export default useUploads;
