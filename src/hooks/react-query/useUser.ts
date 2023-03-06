import { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const queryFn = async () => {
  return (await axios.get<User>(`/api/user`)).data;
};

const useUser = () => {
  return useQuery({
    queryFn,
    queryKey: ["user"],
    retry: false,
  });
};

export default useUser;
