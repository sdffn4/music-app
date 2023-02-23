import {
  RiSpeedFill,
  RiRewindFill,
  RiPauseFill,
  RiPlayFill,
  RiShuffleLine,
  RiPlayListAddLine,
} from "react-icons/ri";

const playerIcon = `w-5 h-5`;

export const PlayIcon = () => <RiPlayFill className={`${playerIcon}`} />;
export const PauseIcon = () => <RiPauseFill className={`${playerIcon}`} />;
export const SkipBackwardIcon = () => (
  <RiRewindFill className={`${playerIcon} opacity-50`} />
);
export const SkipForwardIcon = () => (
  <RiSpeedFill className={`${playerIcon} opacity-50`} />
);
export const ShuffleIconActive = () => (
  <RiShuffleLine className={`${playerIcon}`} />
);
export const CollectIconAction = () => (
  <RiPlayListAddLine className={`${playerIcon}`} />
);
