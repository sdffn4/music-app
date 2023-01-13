import Link from "next/link";
import React from "react";
import { ChevronRightIcon } from "./icons";

interface IListItem {
  to: string;
  text: string;
}

const ListItem: React.FC<IListItem> = ({ to, text }) => {
  return (
    <Link
      href={to}
      className="flex justify-between items-center hover:bg-white hover:bg-opacity-30 hover:cursor-pointer p-4"
    >
      <p className="truncate">{text}</p>
      <p className="px-2">
        <ChevronRightIcon />
      </p>
    </Link>
  );
};

export default ListItem;
