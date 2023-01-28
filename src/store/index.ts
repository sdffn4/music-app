import { TrackType } from "@/types";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type QueueInstance = {
  id: string;
  track: TrackType;
};

type Queue = {
  index: number;
  instances: QueueInstance[];
};

interface Store {
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;

  queue: Queue;
  setQueueInstance: (index: number) => void;
  setQueue: (index: number, tracks: TrackType[]) => void;

  skipBackward: () => void;
  skipForward: () => void;
}

const usePlayerStore = create<Store, [["zustand/devtools", Store]]>(
  devtools((set) => ({
    isPlaying: false,
    setIsPlaying: (value: boolean) => set(() => ({ isPlaying: value })),

    queue: {
      index: -1,
      instances: [],
    },

    setQueue: (index: number, tracks: TrackType[]) =>
      set(() => ({
        queue: {
          index,
          instances: tracks.map((track) => ({ id: nanoid(), track })),
        },
      })),

    setQueueInstance: (index: number) =>
      set((state) => ({
        queue: {
          ...state.queue,
          index,
        },
      })),

    skipBackward: () =>
      set((state) => {
        if (state.queue.index !== -1) {
          return {
            queue: {
              ...state.queue,
              index: state.queue.index - 1,
            },
          };
        } else return state;
      }),

    skipForward: () =>
      set((state) => {
        if (state.queue.index !== -1) {
          return {
            queue: {
              ...state.queue,
              index: state.queue.index + 1,
            },
          };
        } else return state;
      }),
  }))
);

export default usePlayerStore;
