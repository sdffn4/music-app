import {
  CollectIconAction,
  ShuffleIconActive,
} from "@/components/icons/player";
import Track from "@/components/Track";
import useLibrary from "@/hooks/useLibrary";
import usePlayerStore from "@/store";
import { TrackType } from "@/types";
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import { ParsedUrlQuery } from "querystring";
import prisma from "../../lib/prismadb";

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

interface IParams extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const { id } = ctx.params as IParams;

  const resp = await prisma.playlist.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      duration: true,
      tracks: {
        select: {
          track: {
            select: {
              id: true,
              title: true,
              artist: true,
              source: true,
              duration: true,
            },
          },
        },
      },
    },
  });

  return {
    props: {
      ...resp,
      tracks: resp?.tracks.map((track) => ({ ...track.track })),
    },
  };
};

export default function Playlist({
  id,
  title,
  duration,
  tracks,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { isPlaying, queue, setQueue, setIsPlaying } = usePlayerStore(
    (state) => state
  );

  const currentTrack = queue.instances[queue.index]?.track;

  const { data, isLoading: isLoadingQuery } = useLibrary();

  const handleClick = (index: number, track: TrackType) => {
    if (currentTrack?.id === track.id && isPlaying) setIsPlaying(false);

    if (currentTrack?.id === track.id && !isPlaying) setIsPlaying(true);

    if (tracks && currentTrack?.id !== track.id) {
      setQueue(index, tracks);
      setIsPlaying(true);
    }
  };

  return (
    <>
      <div className="flex m-4">
        <img className="w-40 h-40 bg-blue-300 shrink-0" src={undefined} />

        <div className="flex flex-col pt-3 pl-4 overflow-auto">
          <div className="flex">
            <h3
              style={{
                color: undefined,
              }}
              className="font-bold truncate"
            >
              {title}
            </h3>
          </div>

          <div className="py-2">
            <p className="truncate">todo artist name</p>
          </div>

          <div className="pb-2">
            <h3 className="opacity-60 truncate">todo year</h3>
          </div>

          <div className="inline-flex pt-2 h-10 ">
            <button
              style={{
                color: undefined,
              }}
              className={`mr-3 bg-[#131315] rounded-md w-28 flex justify-center items-center`}
            >
              <CollectIconAction />
            </button>

            <button
              style={{ color: undefined }}
              className={`bg-[#131315] rounded-md w-28 flex justify-center items-center`}
            >
              <ShuffleIconActive />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-white divide-opacity-10 mx-6">
        {tracks && tracks.length > 0 ? (
          tracks.map((track, index) => {
            const isActive = track.id === currentTrack?.id && isPlaying;

            return (
              <Track
                key={track.id}
                track={track}
                index={index + 1}
                isActive={isActive}
                onClick={() => handleClick(index, track)}
              />
            );
          })
        ) : (
          <div>This playlist is empty.</div>
        )}
      </div>
    </>
  );
}
