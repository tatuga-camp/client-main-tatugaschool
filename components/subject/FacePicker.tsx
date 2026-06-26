import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IoCheckmark, IoSettingsOutline } from "react-icons/io5";
import { useMeasure } from "react-use";
import { FacePickerLanguage } from "../../data/languages";
import { useSound } from "../../hook";
import { useFaceDetector, type FaceBox } from "../../hook/useFaceDetector";
import { useGetLanguage } from "../../react-query";
import FaceOverlay from "./face-picker/FaceOverlay";
import { headRegion } from "./face-picker/overlayMath";
import { buildRouletteSequence } from "./face-picker/roulette";

type FacePickerProps = { onClose: () => void };
type Phase = "live" | "spinning" | "winner";

export default function FacePicker({ onClose }: FacePickerProps) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const {
    videoRef,
    status,
    faces,
    videoSize,
    devices,
    selectedDeviceId,
    activeDeviceId,
    selectDevice,
    retry,
  } = useFaceDetector();

  const [containerRef, containerSize] = useMeasure<HTMLDivElement>();
  const [phase, setPhase] = useState<Phase>("live");
  const [winnerCrop, setWinnerCrop] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Always-current mirror of `faces` so the roulette's setTimeout callbacks can
  // read the LIVE detections (the closure's `faces` is stale). The overlay and
  // the winner crop both index into this, so the highlight box tracks people as
  // they move and the crop lands on whoever is actually under the box.
  const facesRef = useRef<FaceBox[]>(faces);
  facesRef.current = faces;

  const ding = useSound("/sounds/ding.mp3");
  const cheering = useSound("/sounds/cheering.mp3");

  const isError =
    status === "denied" || status === "no-camera" || status === "error";

  // Lock body scroll while open; on unmount, clear any pending spin timers so a
  // confetti/sound burst can't fire after an ESC/backdrop close (which unmounts
  // this component without going through handleClose), and restore scrolling.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      // Read the ref at unmount time: pickAgain/handleClose reassign the array,
      // so capturing it at mount would clear a stale list.
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    document.body.style.overflow = "auto";
    onClose();
  }, [onClose]);

  // Crop just the winner's head out of the LIVE video at the instant of the
  // pick — the only time we snapshot the camera — and mirror it to match the
  // selfie view, so it can animate up into the centre of the screen.
  const captureHeadCrop = useCallback(
    (box: FaceBox): string | null => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return null;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const head = headRegion(box);
      const sx = head.x * vw;
      const sy = head.y * vh;
      const sw = head.width * vw;
      const sh = head.height * vh;
      if (sw <= 0 || sh <= 0) return null;
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      // Flip horizontally so the crop matches the mirrored preview.
      ctx.translate(sw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
      return canvas.toDataURL("image/jpeg", 0.95);
    },
    [videoRef],
  );

  const startPick = useCallback(() => {
    if (facesRef.current.length === 0) return;

    // Keep the camera AND the overlay live through the whole spin. The sequence
    // only defines the hop count + deceleration; the actual highlight is an
    // index into the live faces at the moment each step fires, wrapped to the
    // current count so it stays valid even as people enter/leave the frame.
    setPhase("spinning");

    const sequence = buildRouletteSequence(facesRef.current.length);
    let elapsed = 0;
    sequence.forEach((step, i) => {
      elapsed += step.delayMs;
      const t = setTimeout(() => {
        const live = facesRef.current;
        if (live.length === 0) return;
        const idx = step.index % live.length;
        setHighlightIndex(idx);
        if (i < sequence.length - 1) {
          if (ding) ding.currentTime = 0;
          ding?.play().catch(() => {});
        } else {
          // The pick has landed: crop the head of whoever is actually under
          // the box right now, straight from the live frame — so the capture
          // is aligned with the video instead of a stale start-of-spin box.
          setWinnerCrop(captureHeadCrop(live[idx]));
          setPhase("winner");
          if (cheering) cheering.currentTime = 0;
          cheering?.play().catch(() => {});
          confetti({
            particleCount: 160,
            spread: 80,
            origin: { y: 0.5 },
          });
        }
      }, elapsed);
      timeouts.current.push(t);
    });
  }, [ding, cheering, captureHeadCrop]);

  const pickAgain = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setWinnerCrop(null);
    setHighlightIndex(null);
    setPhase("live");
  }, []);

  if (isError) {
    const title =
      status === "denied"
        ? FacePickerLanguage.permissionDenied(lang)
        : status === "no-camera"
          ? FacePickerLanguage.noCamera(lang)
          : FacePickerLanguage.loadError(lang);
    return (
      <Shell onClose={handleClose}>
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center font-Anuphan">
          <h2 className="text-2xl font-semibold text-error-color">{title}</h2>
          <p className="max-w-md text-icon-color">
            {FacePickerLanguage.enableCameraHint(lang)}
          </p>
          <button
            onClick={retry}
            className="rounded-2xl bg-primary-color px-6 py-2 font-semibold text-white"
          >
            {FacePickerLanguage.retry(lang)}
          </button>
        </div>
      </Shell>
    );
  }

  const aspect = videoSize ? videoSize.width / videoSize.height : 16 / 9;

  return (
    <Shell onClose={handleClose}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 font-Anuphan">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl bg-black"
          style={{
            aspectRatio: String(aspect),
            // Keep the element exactly at the camera's aspect ratio so
            // object-cover never crops and the overlay boxes stay aligned,
            // while still fitting within 90vw x 70vh.
            width: `min(90vw, ${(70 * aspect).toFixed(2)}vh)`,
          }}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover"
          />
          {containerSize.width > 0 && (
            <FaceOverlay
              faces={faces}
              renderWidth={containerSize.width}
              renderHeight={containerSize.height}
              mirrored
              highlightIndex={highlightIndex}
              isWinner={phase === "winner"}
            />
          )}
          {phase === "winner" && !winnerCrop && (
            <div className="absolute left-0 right-0 top-4 z-30 text-center text-3xl font-bold text-white [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
              {FacePickerLanguage.winner(lang)}
            </div>
          )}
        </div>

        <p className="text-xs text-icon-color/70">
          {FacePickerLanguage.privacy(lang)}
        </p>

        <div className="relative z-40 flex items-center gap-3">
          {phase === "live" && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettings((v) => !v)}
                aria-label={FacePickerLanguage.cameraSettings(lang)}
                title={FacePickerLanguage.cameraSettings(lang)}
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 text-xl transition ${
                  showSettings
                    ? "bg-primary-color text-white"
                    : "bg-white text-icon-color hover:bg-gray-100"
                }`}
              >
                <IoSettingsOutline />
              </button>

              {showSettings && (
                <>
                  {/* Click-away backdrop. */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSettings(false)}
                  />
                  <div className="absolute bottom-full left-1/2 z-50 mb-3 w-72 max-w-[80vw] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                    <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-icon-color/60">
                      {FacePickerLanguage.chooseCamera(lang)}
                    </p>
                    <div className="flex flex-col gap-1">
                      {devices.map((d) => {
                        const isActive =
                          (selectedDeviceId ?? activeDeviceId) === d.deviceId;
                        return (
                          <button
                            key={d.deviceId}
                            type="button"
                            onClick={() => {
                              if (!isActive) selectDevice(d.deviceId);
                              setShowSettings(false);
                            }}
                            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                              isActive
                                ? "bg-primary-color/10 font-semibold text-primary-color"
                                : "text-icon-color hover:bg-gray-100"
                            }`}
                          >
                            <span className="flex w-4 shrink-0 justify-center">
                              {isActive && <IoCheckmark />}
                            </span>
                            <span className="truncate">{d.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {phase === "winner" ? (
            <button
              onClick={pickAgain}
              className="w-48 rounded-full bg-primary-color px-4 py-3 text-lg font-semibold text-white transition hover:scale-105 active:scale-95"
            >
              {FacePickerLanguage.pickAgain(lang)}
            </button>
          ) : (
            <button
              onClick={startPick}
              disabled={
                phase === "spinning" || faces.length === 0 || status !== "ready"
              }
              className="w-48 rounded-full bg-primary-color px-4 py-3 text-lg font-semibold text-white transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {FacePickerLanguage.pick(lang)}
            </button>
          )}
        </div>

        {phase === "live" && faces.length === 0 && status === "ready" && (
          <p className="text-sm text-icon-color/70">
            {FacePickerLanguage.noFaces(lang)}
          </p>
        )}
      </div>

      {/* Winner reveal: the cropped head grows up into the centre of the
          screen. pointer-events-none so the Pick again button (z-40) stays
          clickable underneath. */}
      {phase === "winner" && winnerCrop && (
        <div className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center gap-5">
          <motion.img
            key={winnerCrop}
            src={winnerCrop}
            alt=""
            initial={{ scale: 0.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border-4 border-success-color object-cover shadow-2xl"
            style={{ width: "min(70vw, 44vh)", height: "auto" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-4xl font-bold text-success-color [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]"
          >
            {FacePickerLanguage.winner(lang)}
          </motion.div>
        </div>
      )}
    </Shell>
  );
}

function Shell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-background-color p-5">
      <button
        type="button"
        onClick={onClose}
        className="fixed right-3 top-3 z-40 flex h-8 w-8 items-center justify-center rounded border-2 border-black bg-white text-lg font-semibold hover:bg-gray-300/50"
      >
        <IoMdClose />
      </button>
      {children}
    </div>
  );
}
