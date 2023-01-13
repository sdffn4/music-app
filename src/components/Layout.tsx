import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Player from "./Player";
import Menu from "./Menu";

interface ILayout {
  children: ReactNode;
}

const Layout: React.FC<ILayout> = ({ children }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const onResize = useCallback(() => {
    if (menuRef.current) setHeight(menuRef.current.offsetHeight);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onResize);

    onResize();

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className={`text-white bg-black flex flex-col`}>
      <div
        className={`overflow-auto`}
        style={{ minHeight: `calc(100vh - ${height}px)`, height: 1 }}
      >
        {children}
      </div>

      <div
        className="sticky bottom-0 bg-zinc-900 bg-opacity-70 backdrop-blur-lg"
        ref={menuRef}
      >
        <Player />

        <Menu />
      </div>
    </div>
  );
};

export default Layout;
