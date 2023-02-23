import type { TrackType } from "@/types";

import { Dropdown } from "react-daisyui";

import { EllipsisIcon } from "./icons";
import TrackDropdown from "./TrackDropdown";

interface TrackProps {
  index: number;
  track: TrackType;
  isActive: boolean;
  onClick: () => void;
}

const Track: React.FC<TrackProps> = ({ index, track, isActive, onClick }) => {
  return (
    <div className="flex justify-between items-center mx-4">
      <div className="flex py-2 space-x-2">
        <p className="text-center self-center text-xs opacity-60 w-10 truncate">
          {index + 1}
        </p>

        <p
          className={`self-center truncate ${
            isActive ? "font-bold" : null
          } hover:cursor-pointer hover:underline`}
          onClick={onClick}
        >
          {track.title}
        </p>
      </div>

      <Dropdown horizontal="left" vertical="middle">
        <Dropdown.Toggle size="xs">
          <EllipsisIcon />
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-52 m-1">
          <TrackDropdown index={index} track={track} />
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default Track;
