import { TrackType } from "@/types";
import TrackPresence from "./TrackPresence";

interface TrackProps {
  track: TrackType;
  index: number;
  isActive: boolean;
  dominantColor?: string;
  onClick: () => void;
}

const Track: React.FC<TrackProps> = ({
  track,
  index,
  isActive,
  dominantColor,
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
          {track.title}
        </p>

        {/* <div className="flex-1 truncate" onClick={onClick}>
          {feat ? (
            <p className="font-light pl-1 opacity-60">feat. {feat}</p>
          ) : null}
        </div> */}
      </div>
      <TrackPresence track={track} index={index - 1} />
    </div>
  );
};

export default Track;
