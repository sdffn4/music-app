import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { unstable_getServerSession } from "next-auth";
import prisma from "../../lib/prismadb";
import UploadTracks from "../../components/UploadTracks";
import { authOptions } from "../api/auth/[...nextauth]";

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
  return (
    <div>
      <UploadTracks />
      <div>
        {tracks.length > 0 ? (
          tracks.map((track) => {
            return <div key={track.id}>{track.title}</div>;
          })
        ) : (
          <div>You have no uploaded tracks</div>
        )}
      </div>
    </div>
  );
}
