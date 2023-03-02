import Image from "next/image";
import { useRouter } from "next/router";

import useGetPlaylists from "@/hooks/react-query/useGetPlaylists";

export default function Index() {
  const router = useRouter();

  const { data: playlists } = useGetPlaylists();

  if (!playlists) {
    return (
      <div className="min-h-page flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-page">
      <div className="flex gap-4 justify-center flex-wrap sm:flex-col lg:flex-row">
        {playlists.map((playlist) => {
          return (
            <div
              key={playlist.id}
              className="flex lg:w-1/3 shadow-lg m-2 border border-primary border-opacity-40 divide-x divide-primary divide-opacity-40 hover:cursor-pointer"
              onClick={() => router.push(`/playlist/${playlist.id}`)}
            >
              <div className="w-32 h-32 relative shrink-0">
                <Image
                  fill
                  src={playlist.cover ? playlist.cover : "/vercel.svg"}
                  alt="cover"
                />
              </div>

              <div className="hidden sm:flex p-4 items-center justify-between w-full">
                <div className="flex flex-col space-y-1">
                  <h3 className="text-xl font-medium">{playlist.title}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
