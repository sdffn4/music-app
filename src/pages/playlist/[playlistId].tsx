import type { TrackType } from "@/types";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";

import useLibrary from "@/hooks/react-query/useLibrary";
import useSubscribe from "@/hooks/react-query/useSubscribe";
import useUnsubscribe from "@/hooks/react-query/useUnsubscribe";

import { useSession } from "next-auth/react";

import usePlayerStore from "@/store";

import Track from "@/components/Track";
import { Button, Card } from "react-daisyui";

import prisma from "../../lib/prismadb";

import { v4 as uuidv4 } from "uuid";

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const { playlistId } = ctx.params as { playlistId: string };

  const response = await prisma.playlist.findUnique({
    where: {
      id: playlistId,
    },
    select: {
      id: true,
      title: true,
      duration: true,
      user: {
        select: {
          email: true,
        },
      },
      tracks: {
        include: {
          track: true,
        },
      },
    },
  });

  return {
    props: {
      playlistId: response?.id,
      title: response?.title,
      duration: response?.duration,
      user: response?.user,
      tracks: response?.tracks.map((track) => ({
        ...track.track,
      })),
    },
  };
};

export default function Playlist({
  playlistId,
  title,
  duration,
  tracks,
  user,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const session = useSession();
  const isOwner = session.data?.user?.email === user?.email;

  const library = useLibrary();
  const subscription = library.data?.subscriptions
    .filter((subscription) => subscription.playlist.id === playlistId)
    .pop();
  const isSubscribed = Boolean(subscription);

  const { mutate: mutateSubscription, isLoading: isSubscriptionLoading } =
    useSubscribe();
  const { mutate: mutateUnsubscription, isLoading: isUnsubscriptionLoading } =
    useUnsubscribe();

  const { isPlaying, setIsPlaying, queue, setQueue } = usePlayerStore(
    (state) => state
  );
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

    if (clickedOnNotCurrentTrack && tracks) {
      setQueue(index, tracks);
      setIsPlaying(true);
    }
  };

  const subscribe = () => {
    if (playlistId) {
      const id = uuidv4();
      mutateSubscription({ id, playlistId, title: title ?? "" });
    }
  };

  const unsubscribe = () => {
    if (subscription) {
      mutateUnsubscription({ subscriptionId: subscription.id });
    }
  };

  return (
    <div className="min-h-page">
      <PlaylistHeader
        src=""
        title={title ?? ""}
        duration={duration ?? -1}
        tracksCount={tracks ? tracks.length : -1}
        actions={
          <div>
            {/* GENERAL PLAYLIST ACTIONS */}

            {/* USER-DEPENDENT PLAYLIST ACTIONS*/}
            {isOwner ? (
              <div></div>
            ) : (
              <div>
                {isSubscribed ? (
                  <Button
                    loading={isSubscriptionLoading || isUnsubscriptionLoading}
                    disabled={isSubscriptionLoading || isUnsubscriptionLoading}
                    onClick={unsubscribe}
                  >
                    Unsubscribe
                  </Button>
                ) : (
                  <Button
                    loading={isSubscriptionLoading || isUnsubscriptionLoading}
                    disabled={isSubscriptionLoading || isUnsubscriptionLoading}
                    onClick={subscribe}
                  >
                    Subscribe
                  </Button>
                )}
              </div>
            )}
          </div>
        }
      />

      <div className="divide-y divide-neutral divide-opacity-10">
        {tracks && tracks.length > 0 ? (
          tracks.map((track, index) => {
            const isActive = track.id === currentTrack?.id && isPlaying;

            return (
              <Track
                key={track.id}
                index={index}
                isActive={isActive}
                track={track}
                onClick={() => play(track, index)}
              />
            );
          })
        ) : (
          <div className="flex flex-col justify-center items-center h-full">
            The playlist is empty.
          </div>
        )}
      </div>
    </div>
  );
}

interface PlaylistHeaderProps {
  src: string;
  title: string;
  duration: number;
  tracksCount: number;
  actions: React.ReactNode;
}

const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({
  src,
  title,
  duration,
  tracksCount,
  actions,
}) => {
  return (
    <Card side="sm" className="p-4">
      <Card.Image
        className="w-64 h-64 object-contain"
        src={src ? src : "/vercel.svg"}
        alt="cover"
      />

      <Card.Body className="flex justify-center items-center sm:items-start">
        <Card.Title>{title}</Card.Title>

        <p>
          {duration} mins • {tracksCount} tracks
        </p>

        <Card.Actions>{actions}</Card.Actions>
      </Card.Body>
    </Card>
  );
};