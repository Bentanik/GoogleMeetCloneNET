import { create } from "zustand";

type LobbyState = {
  meetingCode: string;
  displayName: string;
  meetingPassword: string;
  hasPassword: boolean;
};

type LobbyActions = {
  setMeetingCode: (v: string) => void;
  setDisplayName: (v: string) => void;
  setMeetingPassword: (v: string) => void;
  setHasPassword: (v: boolean) => void;
};

export const useLobbyStore = create<LobbyState & LobbyActions>((set) => ({
  meetingCode: "",
  displayName: "",
  meetingPassword: "",
  hasPassword: false,
  setMeetingCode: (v) => set({ meetingCode: v }),
  setDisplayName: (v) => set({ displayName: v }),
  setMeetingPassword: (v) => set({ meetingPassword: v }),
  setHasPassword: (v) => set({ hasPassword: v }),
}));
