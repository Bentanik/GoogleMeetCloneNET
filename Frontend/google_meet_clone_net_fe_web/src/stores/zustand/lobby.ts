import { create } from "zustand";

type LobbyState = {
  meetingCode: string;
  displayName: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  stream: MediaStream | null;
};

type LobbyActions = {
  setMeetingCode: (v: string) => void;
  setDisplayName: (v: string) => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  setStream: (s: MediaStream | null) => void;
};

export const useLobbyStore = create<LobbyState & LobbyActions>((set) => ({
  meetingCode: "",
  displayName: "",
  isVideoEnabled: false,
  isAudioEnabled: false,
  stream: null,
  setMeetingCode: (v) => set({ meetingCode: v }),
  setDisplayName: (v) => set({ displayName: v }),
  toggleVideo: () => set((s) => ({ isVideoEnabled: !s.isVideoEnabled })),
  toggleAudio: () => set((s) => ({ isAudioEnabled: !s.isAudioEnabled })),
  setStream: (s) => set({ stream: s }),
}));
