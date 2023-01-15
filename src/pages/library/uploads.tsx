import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { unstable_getServerSession } from "next-auth";
import prisma from "../../lib/prismadb";
import UploadTracks from "../../components/UploadTracks";
import { authOptions } from "../api/auth/[...nextauth]";
import usePlayerStore from "@/store";
import { TrackType } from "@/types";

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
      album: true,
      artist: true,
      duration: true,
      source: true,
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
  const { isPlaying, currentTrack, setCurrentTrack, setIsPlaying } =
    usePlayerStore((state) => state);

  const handleClick = (track: TrackType) => {
    if (currentTrack?.id === track.id && isPlaying) setIsPlaying(false);

    if (currentTrack?.id === track.id && !isPlaying) setIsPlaying(true);

    if (currentTrack?.id !== track.id) {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  return (
    <div>
      <UploadTracks />
      <div>
        {tracks.length > 0 ? (
          tracks.map((track) => {
            const isActive = track.id === currentTrack?.id && isPlaying;
            return (
              <div
                key={track.id}
                className={`${isActive ? "font-bold" : ""}`}
                onClick={() => handleClick(track)}
              >
                {track.title}
              </div>
            );
          })
        ) : (
          <div>You have no uploaded tracks</div>
        )}
      </div>
    </div>
  );
}
