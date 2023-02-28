import Image from "next/image";
import { Button, Range } from "react-daisyui";
import {
  PauseIcon,
  PlayIcon,
  SkipBackwardIcon,
  SkipForwardIcon,
} from "./icons/player";

interface PlayerProps {
  title: string;
  artist: string;

  isPlaying: boolean;

  hasCurrentTrack: boolean;
  hasPreviousTrack: boolean;
  hasNextTrack: boolean;

  play: () => void;
  pause: () => void;

  volume: number;
  onVolumeChange: (value: number) => void;

  skipBackward: () => void;
  skipForward: () => void;
}

const Player: React.FC<PlayerProps> = ({
  title,
  artist,
  isPlaying,
  hasCurrentTrack,
  hasPreviousTrack,
  hasNextTrack,
  play,
  pause,
  volume,
  onVolumeChange,
  skipBackward,
  skipForward,
}) => {
  return (
    <>
      <div className="flex items-center justify-between w-full mx-4">
        <div className="flex items-center space-x-4 text-sm font-semibold">
          <div className="relative w-12 h-12 border border-primary border-opacity-70">
            <Image src="/vercel.svg" fill alt="cover" />
          </div>

          <div className="flex flex-col">
            <p className="truncate">{title}</p>
            <p className="truncate">{artist}</p>
          </div>
        </div>

        <div className="flex space-x-2 mr-4">
          <Button
            size="xs"
            color="primary"
            disabled={!hasPreviousTrack}
            onClick={skipBackward}
          >
            <SkipBackwardIcon />
          </Button>

          {isPlaying ? (
            <Button
              size="xs"
              color="primary"
              disabled={!hasCurrentTrack}
              onClick={pause}
            >
              <PauseIcon />
            </Button>
          ) : (
            <Button
              size="xs"
              color="primary"
              disabled={!hasCurrentTrack}
              onClick={play}
            >
              <PlayIcon />
            </Button>
          )}

          <Button
            size="xs"
            color="primary"
            disabled={!hasNextTrack}
            onClick={skipForward}
          >
            <SkipForwardIcon />
          </Button>
        </div>

        <div className="hidden sm:block">
          <Range
            size="xs"
            color="primary"
            value={volume}
            max={100}
            onChange={(e) => onVolumeChange(+e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default Player;
