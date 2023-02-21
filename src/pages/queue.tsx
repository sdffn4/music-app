import Track from "@/components/Track";
import usePlayerStore from "@/store";

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

  if (queue.instances.length === 0) {
    return (
      <div className="min-h-page flex flex-col h-full justify-center items-center">
        Queue is empty
      </div>
    );
  }

  return (
    <div className="min-h-page mx-4">
      {queue.instances.map((instance, index) => {
        const currentInstance = queue.instances[queue.index];
        const isActive = instance.id === currentInstance.id && isPlaying;

        return (
          <Track
            key={instance.id}
            index={index + 1}
            isActive={isActive}
            track={instance.track}
            onClick={() => play(index)}
          />
        );
      })}
    </div>
  );
}
