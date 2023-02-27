import type { TrackType } from "@/types";

import { Dropdown } from "react-daisyui";

import { EllipsisIcon } from "./icons";
import TrackDropdown from "./TrackDropdown";

interface TrackProps {
  index: number;
  track: TrackType;
  isActive: boolean;
  onClick: () => void;
  onRemove?: (trackId: string) => void;
}

const Track: React.FC<TrackProps> = ({
  index,
  track,
  isActive,
  onClick,
  onRemove,
}) => {
  return (
    <div className="flex justify-between items-center rounded py-1">
      <div className="flex hover:cursor-pointer" onClick={onClick}>
        <p className="opacity-60 text-sm self-center text-center w-8 m-2 truncate">
          {index}
        </p>

        <div className="w-96">
          <p className={`truncate ${isActive ? "font-bold" : null}`}>
            {track.title}
          </p>
          <p className="truncate text-sm">{track.artist}</p>
        </div>
      </div>

      <Dropdown className="mx-10" horizontal="left" vertical="middle">
        <Dropdown.Toggle size="xs" color="primary">
          <EllipsisIcon />
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-52 m-1">
          <TrackDropdown index={index} track={track} onRemove={onRemove} />
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default Track;
