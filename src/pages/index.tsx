import Head from "next/head";
import Link from "next/link";

import PlaylistCard from "@/components/PlaylistCard";

import prisma from "../lib/prismadb";
import { InferGetStaticPropsType } from "next";

export const getStaticProps = async () => {
  const playlists = await prisma.playlist.findMany({
    select: {
      id: true,
      title: true,
      cover: true,
      tracks: {
        select: {
          track: {
            select: {
              id: true,
              duration: true,
            },
          },
        },
      },
      subscriptions: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      subscriptions: {
        _count: "desc",
      },
    },
  });

  return {
    revalidate: 60 * 5,
    props: {
      playlists: playlists.map((playlist) => ({
        id: playlist.id,
        title: playlist.title,
        cover: playlist.cover,
        duration: playlist.tracks.reduce(
          (acc, { track }) => (acc += track.duration),
          0
        ),
        tracks: playlist.tracks.length,
        subscribers: playlist.subscriptions.length,
      })),
    },
  };
};

export default function Index({
  playlists,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <div className="min-h-page">
        <div className="flex flex-wrap justify-center">
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
