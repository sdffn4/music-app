import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import {
  HomeIconActive,
  HomeIconPassive,
  LibraryIconActive,
  LibraryIconPassive,
  QueueIconActive,
  QueueIconPassive,
  SearchIconActive,
  SearchIconPassive,
  UserIconActive,
  UserIconPassive,
} from "./icons/menu";

interface IMenuButton {
  isActive: boolean;

  activeIcon: ReactNode;
  passiveIcon: ReactNode;
}

const MenuButton: React.FC<IMenuButton> = ({
  isActive,
  activeIcon,
  passiveIcon,
}) => {
  return (
    <div className={`flex justify-center`}>
      {isActive ? activeIcon : passiveIcon}
    </div>
  );
};

const Menu = () => {
  const { pathname } = useRouter();

  return (
    <div className="flex justify-around">
      <Link className={`p-3 w-full`} href={`/`}>
        <MenuButton
          isActive={pathname === `/`}
          activeIcon={<HomeIconActive />}
          passiveIcon={<HomeIconPassive />}
        />
      </Link>
      <Link className={`p-3 w-full`} href={`/library`}>
        <MenuButton
          isActive={pathname === `/library`}
          activeIcon={<LibraryIconActive />}
          passiveIcon={<LibraryIconPassive />}
        />
      </Link>
      <Link className={`p-3 w-full`} href={`/queue`}>
        <MenuButton
          isActive={pathname === `/queue`}
          activeIcon={<QueueIconActive />}
          passiveIcon={<QueueIconPassive />}
        />
      </Link>
      <Link className={`p-3 w-full`} href={`/search`}>
        <MenuButton
          isActive={pathname === `/search`}
          activeIcon={<SearchIconActive />}
          passiveIcon={<SearchIconPassive />}
        />
      </Link>
      <Link className={`p-3 w-full`} href={`/profile`}>
        <MenuButton
          isActive={pathname === `/profile`}
          activeIcon={<UserIconActive />}
          passiveIcon={<UserIconPassive />}
        />
      </Link>
    </div>
  );
};

export default Menu;
