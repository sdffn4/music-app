import { TrackType } from "@/types";
import { create } from "zustand";

interface Store {
  currentTrack: TrackType | null;
  setCurrentTrack: (track: TrackType) => void;

  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
}

const usePlayerStore = create<Store>((set) => ({
  currentTrack: null,
  setCurrentTrack: (track: TrackType) =>
    set((state) => ({ currentTrack: track })),
  isPlaying: false,
  setIsPlaying: (value: boolean) => set((state) => ({ isPlaying: value })),
}));

export default usePlayerStore;
