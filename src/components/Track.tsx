import TrackPresence from "./TrackPresence";

interface TrackProps {
  trackId: string;
  index: number;
  isActive: boolean;
  dominantColor?: string;
  title: string;
  onClick: () => void;
}

const Track: React.FC<TrackProps> = ({
  trackId,
  index,
  isActive,
  dominantColor,
  title,
  onClick,
}) => {
  return (
    <div className="flex justify-between py-2">
      <div className="flex truncate justify-center items-center">
        <p className="text-xs px-4 opacity-60 ">{index}</p>

        <p
          className="flex truncate items-baseline hover:cursor-pointer"
          style={
            isActive ? { color: dominantColor, fontWeight: "bold" } : undefined
          }
          onClick={onClick}
        >
          {title}
        </p>

        {/* <div className="flex-1 truncate" onClick={onClick}>
          {feat ? (
            <p className="font-light pl-1 opacity-60">feat. {feat}</p>
          ) : null}
        </div> */}
      </div>
      <TrackPresence trackId={trackId} />
    </div>
  );
};

export default Track;
