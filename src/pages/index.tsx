import { useRouter } from "next/router";
import { EllipsisIcon } from "../components/icons";

export default function Index() {
  const router = useRouter();

  return (
    <>
      <div className="flex mx-4 mt-4 pt-5">
        <div className="flex">
          <h3 className="font-bold text-3xl truncate pr-2">Welcome,</h3>
        </div>

        <div className="flex-1">
          <h3 className="font-extrabold text-3xl truncate">John Doe!</h3>
        </div>

        <div className="flex text-2xl truncate items-center">
          <EllipsisIcon />
        </div>
      </div>

      <div className="flex">
        <div className="flex grow mx-4 mt-2 rounded-md border justify-center items-center">
          <h3 className="text-8xl font-extrabold"></h3>
        </div>

        <div className="flex justify-center mr-4 mt-2 ">
          <div className="grid grid-rows-4">
            <div className="flex justify-center mx-1 px-3 py-1 rounded-md border">
              <button className="text-lg">D</button>
            </div>

            <div className="flex justify-center mx-1 px-3 py-1 rounded-md border">
              <button className="text-lg">W</button>
            </div>

            <div className="flex justify-center mx-1 px-3 py-1 rounded-md border">
              <button className="text-lg">M</button>
            </div>

            <div className="flex justify-center mx-1 px-3 py-1 rounded-md border">
              <button className="text-lg">A</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex mx-4 mt-1 mb-2 pt-2">
        <div className="flex-1">
          <h3 className="font-bold text-2xl truncate">Library</h3>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-white/30 mx-4 mt-1">
        <button
          className="text-lg flex items-center py-2"
          onClick={() => router.push(`/home/playlists`)}
        >
          <p className="text-lg flex items-center py-2">
            <EllipsisIcon />
          </p>
          <p className="px-5 grow text-left text-xl">Playlists</p>
          <p className="text-lg flex items-center py-2">
            <EllipsisIcon />
          </p>
        </button>

        <button
          className="text-lg flex items-center py-2"
          onClick={() => router.push(`/home/albums`)}
        >
          <p>
            <EllipsisIcon />
          </p>
          <p className="pl-5 text-left text-xl">Albums</p>
          <p>
            <EllipsisIcon />
          </p>
        </button>

        <button
          className="text-lg flex items-center py-2"
          onClick={() => router.push(`/home/songs`)}
        >
          <p>
            <EllipsisIcon />
          </p>
          <p className="pl-5 text-left text-xl">Songs</p>
          <p>
            <EllipsisIcon />
          </p>
        </button>

        <button
          className="text-lg flex items-center py-2"
          onClick={() => router.push(`/home/artists`)}
        >
          <p>
            <EllipsisIcon />
          </p>
          <p className="pl-5 text-left text-xl">Artists</p>
          <p>
            <EllipsisIcon />
          </p>
        </button>

        <button className="text-lg flex items-center py-2">
          <p>
            <EllipsisIcon />
          </p>
          <p className="pl-5 text-left text-xl">Discover</p>
          <p>
            <EllipsisIcon />
          </p>
        </button>
      </div>
    </>
  );
}
