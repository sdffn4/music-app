import Head from "next/head";
import Link from "next/link";

import PlaylistCard from "@/components/PlaylistCard";

import useGetPlaylists from "@/hooks/react-query/useGetPlaylists";

export default function Index() {
  const { data: playlists } = useGetPlaylists();

  if (!playlists) {
    return (
      <div className="min-h-page flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <div className="min-h-page">
        <div className="flex justify-center flex-wrap sm:flex-col lg:flex-row">
          {playlists.map((playlist) => {
            return (
              <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                <PlaylistCard
                  title={playlist.title}
                  cover={playlist.cover}
                  duration={playlist.duration}
                  subscribers={playlist.subscribers}
                  tracks={playlist.tracks}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
