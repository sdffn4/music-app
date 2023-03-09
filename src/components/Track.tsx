import type { TrackType } from "@/types";

import { Button, Dropdown } from "react-daisyui";

import { EllipsisIcon, GoBackIcon } from "./icons";
import TrackDropdown from "./TrackDropdown";

interface TrackProps {
  index: number;
  track: TrackType;
  isActive: boolean;
  onClick: () => void;
  isStaged?: boolean;
  restore?: () => void;
}

const Track: React.FC<TrackProps> = ({
  index,
  track,
  isStaged = false,
  isActive,
  onClick,
  restore,
}) => {
  return (
    <div className="flex justify-between items-center rounded py-1">
      <div
        className={`w-full truncate flex ${
          isStaged ? null : "hover:cursor-pointer"
        }`}
        onClick={onClick}
      >
        <div
          className={`opacity-${
            isStaged ? 30 : 60
          } text-xs self-center text-center`}
        >
          <p className="truncate w-8 mx-2">{index + 1}</p>
        </div>

        <div className={`truncate ${isStaged ? "opacity-40" : null}`}>
          <p className={`truncate ${isActive ? "font-bold" : null}`}>
            {track.title}
          </p>
          <p
            className={`text-sm truncate ${isActive ? "font-semibold" : null}`}
          >
            {track.artist}
          </p>
        </div>
      </div>

      <div className="mx-10">
        {isStaged ? (
          <Button size="xs" color="secondary" onClick={restore}>
            <GoBackIcon />
          </Button>
        ) : (
          <Dropdown horizontal="left" vertical="middle">
            <Dropdown.Toggle size="xs" color="primary">
              <EllipsisIcon />
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-52 m-1">
              <TrackDropdown index={index} track={track} />
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default Track;
