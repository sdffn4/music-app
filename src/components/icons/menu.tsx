import {
  RiCheckboxBlankFill,
  RiCheckboxBlankLine,
  RiSearch2Line,
  RiRhythmLine,
  RiRhythmFill,
  RiAddBoxFill,
  RiAddBoxLine,
  RiSearch2Fill,
  RiCheckboxBlankCircleFill,
  RiCheckboxBlankCircleLine,
} from "react-icons/ri";

const activeMenuIcon = `w-[24px] h-[24px] opacity-100`;
const passiveMenuIcon = `w-[24px] h-[24px] opacity-50`;

/* active buttons */
export const HomeIconActive = () => (
  <RiCheckboxBlankFill className={`${activeMenuIcon}`} />
);
export const LibraryIconActive = () => (
  <RiAddBoxFill className={`${activeMenuIcon}`} />
);
export const QueueIconActive = () => (
  <RiRhythmFill className={`${activeMenuIcon}`} />
);
export const SearchIconActive = () => (
  <RiSearch2Fill className={`${activeMenuIcon}`} />
);
export const UserIconActive = () => (
  <RiCheckboxBlankCircleFill className={`${activeMenuIcon}`} />
);

/* passive buttons */
export const HomeIconPassive = () => (
  <RiCheckboxBlankLine className={`${passiveMenuIcon}`} />
);
export const LibraryIconPassive = () => (
  <RiAddBoxLine className={`${passiveMenuIcon}`} />
);
export const QueueIconPassive = () => (
  <RiRhythmLine className={`${passiveMenuIcon}`} />
);
export const SearchIconPassive = () => (
  <RiSearch2Line className={`${passiveMenuIcon}`} />
);
export const UserIconPassive = () => (
  <RiCheckboxBlankCircleLine className={`${passiveMenuIcon}`} />
);
