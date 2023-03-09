import type { TrackType } from "@/types";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";

import useUnmount from "@/hooks/useUnmount";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import usePlayerStore from "@/store";

import useLibrary from "@/hooks/react-query/queries/useLibrary";
import useSubscribe from "@/hooks/react-query/mutations/useSubscribe";
import useUnsubscribe from "@/hooks/react-query/mutations/useUnsubscribe";
import useRemoveTracks from "@/hooks/react-query/mutations/useRemoveTracks";
import useCheckAllTracks from "@/hooks/react-query/mutations/useCheckAllTracks";

import Image from "next/image";
import Track from "@/components/Track";
import { Button } from "react-daisyui";

import { v4 as uuidv4 } from "uuid";
import prisma from "../../lib/prismadb";
import { NoteIcon, TimerIcon, UserIcon } from "@/components/icons";
import { formatDuration } from "@/lib/utils";
import Head from "next/head";

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const { playlistId } = ctx.params as { playlistId: string };

  const resp = await prisma.playlist.findUnique({
    where: {
      id: playlistId,
    },

    select: {
      id: true,
      title: true,
      cover: true,
      user: {
        select: {
          email: true,
        },
      },
      tracks: {
        select: {
          track: {
            select: {
              id: true,
              title: true,
              artist: true,
              duration: true,
              source: true,
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
  });

  if (!resp)
    return {
      notFound: true,
    };

  return {
    props: {
      playlist: {
        id: resp.id,
        title: resp.title,
        cover: resp.cover,
        duration: resp.tracks.reduce(
          (acc, { track }) => (acc += track.duration),
          0
        ),
        subscribers: resp.subscriptions.length,
        user: resp.user,
        tracks: resp.tracks.map((track) => ({ ...track.track })),
      },
    },
  };
};

export default function Playlist({
  playlist,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const session = useSession();
  const isSessionUserOwner = playlist.user.email === session.data?.user?.email;

  const { data: library, isLoading: isLibraryLoading } = useLibrary();

  const subscription = library?.subscriptions
    .filter((subscription) => subscription.playlistId === playlist.id)
    .pop();

  const isSessionUserSubscribed = Boolean(subscription);

  const { mutate: mutateRemove } = useRemoveTracks();

  const { mutate: checkAllTracks } = useCheckAllTracks();

  const { mutate: mutateSubscription, isLoading: isSubscriptionLoading } =
    useSubscribe();

  const { mutate: mutateUnsubscription, isLoading: isUnsubscriptionLoading } =
    useUnsubscribe();

  const [stagedTracks, setStagedTracks] = useState<string[]>([]);

  const stageTrack = (trackId: string) => {
    setStagedTracks((previous) => [...previous, trackId]);
  };

  const restoreTrack = (trackId: string) => {
    setStagedTracks((previous) => previous.filter((id) => id !== trackId));
  };

  useUnmount(() => {
    if (stagedTracks.length > 0) {
      mutateRemove({ playlistId: playlist.id, tracks: stagedTracks });
    }
  });

  useEffect(() => {
    if (subscription && subscription.uncheckedTracks.length > 0) {
      checkAllTracks({ subscriptionId: subscription.id });
    }
  }, [subscription, checkAllTracks]);

  const { isPlaying, setIsPlaying, queue, setQueue, addToQueue } =
    usePlayerStore((state) => state);

  const currentTrack = queue.instances[queue.index]?.track;

  const play = (track: TrackType, index: number) => {
    const clickedOnCurrentPlayingTrack =
      currentTrack?.id === track.id && isPlaying;
    const clickedOnCurrentNotPlayingTrack =
      currentTrack?.id === track.id && !isPlaying;
    const clickedOnNotCurrentTrack = currentTrack?.id !== track.id;

    if (clickedOnCurrentPlayingTrack) {
      setIsPlaying(false);
    }

    if (clickedOnCurrentNotPlayingTrack) {
      setIsPlaying(true);
    }

    if (clickedOnNotCurrentTrack && playlist.tracks) {
      setQueue(index, playlist.tracks);
      setIsPlaying(true);
    }
  };

  const subscribe = () => {
    mutateSubscription({
      id: uuidv4(),
      playlistId: playlist.id,
      title: playlist.title,
      duration: playlist.duration,
      cover: playlist.cover,
      tracks: playlist.tracks.length,
      subscribers: playlist.subscribers,
    });
  };

  const unsubscribe = () => {
    if (subscription) {
      mutateUnsubscription({ subscriptionId: subscription.id });
    }
  };

  return (
    <>
      <Head>
        <title>{playlist.title}</title>
      </Head>

      <div className="min-h-page">
        <div className="sm:flex p-4 pb-0 sm:pb-4 text-center sm:text-start border-b border-primary border-opacity-10">
          <div className="relative w-44 h-44 border border-primary border-opacity-80 m-auto sm:m-0">
            <Image
              alt="cover"
              src={playlist.cover ? playlist.cover : "/vercel.svg"}
              fill
            />
          </div>

          <div className="flex flex-col justify-evenly px-6">
            <div className="pt-3 space-y-1">
              <h3 className="font-semibold text-lg truncate">
                {playlist.title}
              </h3>

              <div className="space-x-3 text-sm opacity-80">
                <div className="flex space-x-3 text-sm opacity-80">
                  <span className="flex items-center space-x-1">
                    <NoteIcon /> <span>{playlist.tracks.length}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <TimerIcon />{" "}
                    <span>{formatDuration(playlist.duration)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <UserIcon /> <span>{playlist.subscribers}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="my-4">
              {isSessionUserOwner ? null : (
                <Button
                  size="sm"
                  color="primary"
                  loading={isSubscriptionLoading || isUnsubscriptionLoading}
                  disabled={
                    isSubscriptionLoading ||
                    isUnsubscriptionLoading ||
                    isLibraryLoading
                  }
                  onClick={isSessionUserSubscribed ? unsubscribe : subscribe}
                >
                  {isSessionUserSubscribed ? "Unsubscribe" : "Subscribe"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {playlist.tracks.length > 0 ? (
          <div className="divide-y divide-primary divide-opacity-30">
            {playlist.tracks.map((track, index) => {
              const isActive = track.id === currentTrack?.id && isPlaying;
              const isStaged = stagedTracks.includes(track.id);

              return (
                <Track
                  key={track.id}
                  index={index}
                  track={track}
                  isStaged={isStaged}
                  isActive={isActive}
                  restore={() => restoreTrack(track.id)}
                  onClick={() => play(track, index)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center text-lg p-4">This playlist is empty.</div>
        )}
      </div>
    </>
  );
}
