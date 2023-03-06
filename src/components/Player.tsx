import Image from "next/image";
import { Button, Range, Swap } from "react-daisyui";
import {
  PauseIcon,
  PlayIcon,
  SkipBackwardIcon,
  SkipForwardIcon,
  VolumeDownIcon,
  VolumeMuteIcon,
  VolumeUpIcon,
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
  onVolumeClick: () => void;
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
  onVolumeClick,
  onVolumeChange,
  skipBackward,
  skipForward,
}) => {
  return (
    <>
      <div className="flex items-center justify-between w-full mx-4">
        <div className="basis-1/3 flex items-center space-x-4 text-sm font-semibold">
          <div className="relative w-12 h-12 border border-primary border-opacity-70">
            <Image src="/vercel.svg" fill alt="cover" />
          </div>

          <div className="flex flex-col">
            <p className="truncate">{title ?? "No track is set"}</p>
            <p className="truncate">{artist ?? "No track is set"}</p>
          </div>
        </div>

        <div className="basis-1/3 flex justify-center space-x-2 mr-4">
          <button
            className={`p-1 disabled:cursor-not-allowed hover:rounded-full ${
              hasPreviousTrack ? null : "opacity-60"
            }`}
            disabled={!hasPreviousTrack}
            onClick={skipBackward}
          >
            <SkipBackwardIcon />
          </button>

          {isPlaying ? (
            <button
              className={`p-1 disabled:cursor-not-allowed hover:rounded-full ${
                hasCurrentTrack ? null : "opacity-60"
              }`}
              disabled={!hasCurrentTrack}
              onClick={pause}
            >
              <PauseIcon />
            </button>
          ) : (
            <button
              className={`p-1 disabled:cursor-not-allowed hover:rounded-full ${
                hasCurrentTrack ? null : "opacity-60"
              }`}
              disabled={!hasCurrentTrack}
              onClick={play}
            >
              <PlayIcon />
            </button>
          )}

          <button
            className={`p-1 disabled:cursor-not-allowed hover:rounded-full ${
              hasNextTrack ? null : "opacity-60"
            }`}
            disabled={!hasNextTrack}
            onClick={skipForward}
          >
            <SkipForwardIcon />
          </button>
        </div>

        <div className="hidden sm:basis-1/3 sm:flex sm:justify-end sm:items-center sm:space-x-1">
          <button className="p-2" onClick={onVolumeClick}>
            {volume === 0 ? (
              <VolumeMuteIcon />
            ) : volume > 50 ? (
              <VolumeUpIcon />
            ) : (
              <VolumeDownIcon />
            )}
          </button>

          <input
            className="w-32 h-2"
            type="range"
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
