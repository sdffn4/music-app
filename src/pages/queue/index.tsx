import Track from "@/components/Track";
import usePlayerStore from "@/store";
import { TrackType } from "@/types";

export default function Queue() {
  const { isPlaying, setIsPlaying, queue, setQueueInstance } = usePlayerStore(
    (state) => state
  );

  const currentInstance = queue.instances[queue.index];

  const handleClick = (index: number) => {
    setQueueInstance(index);

    if (queue.index === index && isPlaying) setIsPlaying(false);

    if (queue.index === index && !isPlaying) setIsPlaying(true);

    if (queue.index !== index) setIsPlaying(true);
  };

  return (
    <div>
      {queue.instances.length ? (
        queue.instances.map((instance, index) => {
          return (
            <Track
              key={instance.id}
              index={index + 1}
              isActive={instance.id === currentInstance.id && isPlaying}
              track={instance.track}
              onClick={() => handleClick(index)}
            />
          );
        })
      ) : (
        <div>Your queue is empty.</div>
      )}
    </div>
  );
}
