import usePlayerStore from "@/store";
import Track from "@/components/Track";
import Head from "next/head";

export default function Queue() {
  const { isPlaying, setIsPlaying, queue, setQueueInstance } = usePlayerStore(
    (state) => state
  );

  const play = (index: number) => {
    setQueueInstance(index);

    const clickedOnCurrentPlayingTrack = queue.index === index && isPlaying;
    const clickedOnCurrentNotPlayingTrack = queue.index === index && !isPlaying;
    const clickedOnNotCurrentTrack = queue.index !== index;

    if (clickedOnCurrentPlayingTrack) {
      setIsPlaying(false);
    }

    if (clickedOnCurrentNotPlayingTrack || clickedOnNotCurrentTrack) {
      setIsPlaying(true);
    }
  };

  return (
    <>
      <Head>
        <title>Queue</title>
      </Head>

      <div className="min-h-page p-4">
        {queue.instances.length > 0 ? (
          queue.instances.map((instance, index) => {
            const currentInstance = queue.instances[queue.index];
            const isActive = instance.id === currentInstance.id && isPlaying;

            return (
              <div key={instance.id} className="w-full">
                <Track
                  index={index}
                  track={instance.track}
                  isActive={isActive}
                  onClick={() => play(index)}
                />
              </div>
            );
          })
        ) : (
          <div className="text-center p-16">Queue is empty</div>
        )}
      </div>
    </>
  );
}
