import {
  BarChartIcon,
  ColumnsIcon,
  GearIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

export const menuButtons = [
  {
    href: "/",
    icon: <HomeIcon />,
  },
  {
    href: "/library",
    icon: <ColumnsIcon />,
  },
  {
    href: "/queue",
    icon: <BarChartIcon />,
  },
  {
    href: "/search",
    icon: <MagnifyingGlassIcon />,
  },
  {
    href: "/profile",
    icon: <GearIcon />,
  },
];
