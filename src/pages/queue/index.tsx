import Track from "@/components/Track";
import usePlayerStore from "@/store";

export default function Queue() {
  const { queue, setQueueInstance } = usePlayerStore((state) => state);

  const currentInstance = queue.instances[queue.index];

  const handleClick = (index: number) => {
    setQueueInstance(index);
  };

  return (
    <div>
      {queue.instances.map((instance, index) => {
        return (
          <Track
            key={instance.id}
            index={index + 1}
            isActive={instance.id === currentInstance.id}
            title={instance.track.title}
            trackId={instance.track.id}
            onClick={() => handleClick(index)}
          />
        );
      })}
    </div>
  );
}
