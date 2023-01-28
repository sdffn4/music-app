import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { unstable_getServerSession } from "next-auth";
import prisma from "../../lib/prismadb";
import UploadTracks from "../../components/UploadTracks";
import { authOptions } from "../api/auth/[...nextauth]";
import usePlayerStore from "@/store";
import { TrackType } from "@/types";
import Track from "@/components/Track";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "/profile",
        permanent: true,
      },
    };
  }

  const tracks = await prisma.track.findMany({
    where: {
      user: {
        email: session.user?.email,
      },
    },
    select: {
      id: true,
      title: true,
      artist: true,
      source: true,
      duration: true,
      playlists: {
        select: {
          playlistId: true,
        },
      },
    },
  });

  return {
    props: {
      tracks,
    },
  };
};

export default function Uploads({
  tracks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { isPlaying, queue, setQueue, setIsPlaying } = usePlayerStore(
    (state) => state
  );

  const currentTrack = queue.instances[queue.index]?.track;

  const handleClick = (index: number, track: TrackType) => {
    if (currentTrack?.id === track.id && isPlaying) setIsPlaying(false);

    if (currentTrack?.id === track.id && !isPlaying) setIsPlaying(true);

    if (currentTrack?.id !== track.id) {
      setQueue(index, tracks);
      setIsPlaying(true);
    }
  };

  return (
    <div>
      <UploadTracks />
      <div className="flex flex-col divide-y divide-white divide-opacity-10 mx-6">
        {tracks.length > 0 ? (
          tracks.map((track, index) => {
            const isActive = track.id === currentTrack?.id && isPlaying;

            return (
              <Track
                key={track.id}
                trackId={track.id}
                index={index + 1}
                isActive={isActive}
                title={track.title}
                onClick={() => handleClick(index, track)}
              />
            );
          })
        ) : (
          <div>You have no uploaded tracks</div>
        )}
      </div>
    </div>
  );
}
