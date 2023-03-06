import {
  RiSpeedFill,
  RiRewindFill,
  RiPauseFill,
  RiPlayFill,
  RiShuffleLine,
  RiPlayListAddLine,
  RiVolumeMuteLine,
  RiVolumeDownLine,
  RiVolumeUpLine,
} from "react-icons/ri";

const playerIcon = `w-5 h-5`;

export const PlayIcon = () => <RiPlayFill className={`${playerIcon}`} />;

export const PauseIcon = () => <RiPauseFill className={`${playerIcon}`} />;

export const SkipBackwardIcon = () => (
  <RiRewindFill className={`${playerIcon}`} />
);

export const SkipForwardIcon = () => (
  <RiSpeedFill className={`${playerIcon}`} />
);

export const ShuffleIconActive = () => (
  <RiShuffleLine className={`${playerIcon}`} />
);

export const CollectIconAction = () => (
  <RiPlayListAddLine className={`${playerIcon}`} />
);

export const VolumeMuteIcon = () => (
  <RiVolumeMuteLine className={`${playerIcon} opacity-70`} />
);

export const VolumeDownIcon = () => (
  <RiVolumeDownLine className={`${playerIcon} opacity-70`} />
);

export const VolumeUpIcon = () => (
  <RiVolumeUpLine className={`${playerIcon} opacity-70`} />
);
