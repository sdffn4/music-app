import { TrackType } from "@/types";
import { nanoid } from "nanoid";
import { create } from "zustand";

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

  addToQueue: (track: TrackType) => void;
  removeFromQueue: (index: number) => void;

  skipBackward: () => void;
  skipForward: () => void;
}

const usePlayerStore = create<Store>((set) => ({
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

  addToQueue: (track: TrackType) =>
    set((state) => {
      if (state.queue.instances.length === 0) {
        return {
          queue: {
            index: 0,
            instances: [{ id: nanoid(), track }],
          },
        };
      } else {
        return {
          queue: {
            ...state.queue,
            instances: [...state.queue.instances, { id: nanoid(), track }],
          },
        };
      }
    }),

  removeFromQueue: (index: number) =>
    set((state) => {
      const newIndex: number =
        state.queue.index === index &&
        state.queue.instances.length - 1 === index
          ? state.queue.index - 1
          : state.queue.index > index
          ? state.queue.index - 1
          : state.queue.index;

      const newInstances = state.queue.instances.filter(
        (_, idx) => index !== idx
      );

      return {
        queue: {
          index: newIndex,
          instances: newInstances,
        },
        isPlaying: newInstances.length === 0 ? false : state.isPlaying,
      };
    }),

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
}));

export default usePlayerStore;
