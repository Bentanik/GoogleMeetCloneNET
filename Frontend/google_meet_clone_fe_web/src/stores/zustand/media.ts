import { create } from "zustand";

type MediaState = {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  stream: MediaStream | null;
};

type MediaActions = {
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleScreenShare: () => void;
  setStream: (s: MediaStream | null) => void;
  requestStream: (wantVideo: boolean, wantAudio: boolean) => Promise<void>;
  stopStream: () => void;
};

export const useMediaStore = create<MediaState & MediaActions>((set, get) => ({
  isVideoEnabled: false,
  isAudioEnabled: false,
  isScreenSharing: false,
  stream: null,
  toggleVideo: () => set((s) => ({ isVideoEnabled: !s.isVideoEnabled })),
  toggleAudio: () => set((s) => ({ isAudioEnabled: !s.isAudioEnabled })),
  toggleScreenShare: () =>
    set((s) => ({ isScreenSharing: !s.isScreenSharing })),
  setStream: (s) => set({ stream: s }),
  requestStream: async (wantVideo: boolean, wantAudio: boolean) => {
    const current = get().stream;
    const hasVideo = !!current?.getVideoTracks().length;
    const hasAudio = !!current?.getAudioTracks().length;

    // If already matches, just enable/disable tracks
    if (current && hasVideo === wantVideo && hasAudio === wantAudio) {
      try {
        current.getVideoTracks().forEach((t) => (t.enabled = wantVideo));
        current.getAudioTracks().forEach((t) => (t.enabled = wantAudio));
      } catch (err) {}
      return;
    }

    // If no desired media, stop
    if (!wantVideo && !wantAudio) {
      if (current) {
        try {
          current.getTracks().forEach((t) => {
            t.stop();
            t.enabled = false;
          });
        } catch (err) {}
      }
      set({ stream: null });
      return;
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: wantVideo,
        audio: wantAudio,
      });
      if (current) {
        try {
          current.getTracks().forEach((t) => {
            t.stop();
            t.enabled = false;
          });
        } catch (err) {}
      }
      set({ stream: newStream });
    } catch (err) {
      console.error("[mediaStore] requestStream error:", err);
    }
  },
  stopStream: () => {
    const current = get().stream;
    if (current) {
      try {
        current.getTracks().forEach((t) => {
          t.stop();
          t.enabled = false;
        });
      } catch (err) {}
    }
    set({ stream: null });
  },
}));
