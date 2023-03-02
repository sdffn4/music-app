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

import useLibrary from "@/hooks/react-query/useLibrary";
import useSubscribe from "@/hooks/react-query/useSubscribe";
import useUnsubscribe from "@/hooks/react-query/useUnsubscribe";
import useRemoveTracks from "@/hooks/react-query/useRemoveTracks";
import useCheckAllTracks from "@/hooks/react-query/useCheckAllTracks";

import Image from "next/image";
import Track from "@/components/Track";
import { Button } from "react-daisyui";

import { v4 as uuidv4 } from "uuid";
import prisma from "../../lib/prismadb";
import useAddTrack from "@/hooks/react-query/useAddTrack";
import TrackDropdown from "@/components/TrackDropdown";

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
      duration: true,
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
        ...resp,
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
    .filter((subscription) => subscription.playlist.id === playlist.id)
    .pop();

  const isSessionUserSubscribed = Boolean(subscription);

  const { mutate: mutateAdd } = useAddTrack();

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
    });
  };

  const unsubscribe = () => {
    if (subscription) {
      mutateUnsubscription({ subscriptionId: subscription.id });
    }
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    mutateAdd({ playlistId, trackId });
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    if (playlist.id === playlistId) {
      stageTrack(trackId);
    } else {
      mutateRemove({ playlistId, tracks: [trackId] });
    }
  };

  return (
    <div className="min-h-page divide-y divide-primary divide-opacity-60">
      <div className="sm:flex p-4 pb-0 sm:pb-4 text-center sm:text-start">
        <div className="relative w-44 h-44 border border-primary border-opacity-80 m-auto sm:m-0">
          <Image
            alt="cover"
            src={playlist.cover ? playlist.cover : "/vercel.svg"}
            fill
          />
        </div>

        <div className="flex flex-col justify-evenly px-6">
          <div className="pt-3 space-y-1">
            <h3 className="font-semibold text-lg truncate">{playlist.title}</h3>

            <div className="truncate">
              <span>{`${playlist.tracks.length} track${
                playlist.tracks.length !== 1 ? "s" : ""
              } `}</span>
              •
              <span>
                {` ${playlist.duration} minute${
                  playlist.duration !== 1 ? "s" : ""
                }`}
              </span>
            </div>

            <span>
              {`${playlist.subscriptions.length} subscriber${
                playlist.subscriptions.length !== 1 ? "s" : ""
              }`}
            </span>
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
                dropdown={
                  <TrackDropdown
                    trackId={track.id}
                    playlists={library ? library.playlists : []}
                    addToQueue={() => addToQueue(track)}
                    addTrackToPlaylist={(playlistId) =>
                      addTrackToPlaylist(playlistId, track.id)
                    }
                    removeTrackFromPlaylist={(playlistId) =>
                      removeTrackFromPlaylist(playlistId, track.id)
                    }
                  />
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center text-lg p-4">This playlist is empty.</div>
      )}
    </div>
  );
}
