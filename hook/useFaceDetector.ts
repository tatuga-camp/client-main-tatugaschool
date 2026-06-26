import { useCallback, useEffect, useRef, useState } from "react";
import type { ObjectDetector as MpObjectDetector } from "@mediapipe/tasks-vision";

// A normalized (0..1) detection box. These are now whole-person boxes from the
// COCO "person" class, not faces — see MODEL_PATH below — but everything
// downstream treats them as generic boxes, so the name is kept for stability.
export type FaceBox = { x: number; y: number; width: number; height: number };
export type FaceDetectorStatus =
  | "loading"
  | "ready"
  | "denied"
  | "no-camera"
  | "error";
export type CameraDevice = { deviceId: string; label: string };
export type UseFaceDetector = {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: FaceDetectorStatus;
  faces: FaceBox[];
  videoSize: { width: number; height: number } | null;
  devices: CameraDevice[];
  selectedDeviceId: string | null;
  /** The deviceId actually in use (from the live track) — set even before the
   *  user manually picks one, so the UI can mark the active camera. */
  activeDeviceId: string | null;
  selectDevice: (deviceId: string) => void;
  retry: () => void;
};

const WASM_PATH = "/assets/mediapipe/wasm";
// Person detection (COCO "person" class) instead of face detection, so students
// far from the camera — or turned away — are still picked up. Distance is a
// model-capability issue: the short-range face model only sees faces within
// ~2m, whereas this detects the whole human shape across the room.
const MODEL_PATH = "/assets/mediapipe/models/efficientdet_lite0.tflite";

export function useFaceDetector(
  opts: { enabled?: boolean } = {},
): UseFaceDetector {
  const enabled = opts.enabled ?? true;

  const videoRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef<MpObjectDetector | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [status, setStatus] = useState<FaceDetectorStatus>("loading");
  const [faces, setFaces] = useState<FaceBox[]>([]);
  const [videoSize, setVideoSize] =
    useState<{ width: number; height: number } | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [restartKey, setRestartKey] = useState(0);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setRestartKey((k) => k + 1);
  }, []);

  const retry = useCallback(() => {
    setStatus("loading");
    setRestartKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const run = async () => {
      try {
        setStatus("loading");

        const { FilesetResolver, ObjectDetector } = await import(
          "@mediapipe/tasks-vision"
        );
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
        const detector = await ObjectDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate: "GPU" },
          runningMode: "VIDEO",
          // Only the "person" class, and a lenient threshold — we just need
          // "there's a human here", not a confident, well-framed face.
          categoryAllowlist: ["person"],
          scoreThreshold: 0.3,
          maxResults: 50,
        });
        if (cancelled) {
          detector.close();
          return;
        }
        detectorRef.current = detector;

        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode: "user" },
          audio: false,
        };
        const stream =
          await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        if (cancelled) return;

        setVideoSize({
          width: video.videoWidth,
          height: video.videoHeight,
        });

        // Record which camera the browser actually opened so the settings UI
        // can mark the active one even when the user hasn't picked manually.
        const activeId = stream.getVideoTracks()[0]?.getSettings().deviceId;
        if (activeId) setActiveDeviceId(activeId);

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        setDevices(
          allDevices
            .filter((d) => d.kind === "videoinput")
            .map((d) => ({
              deviceId: d.deviceId,
              label: d.label || "Camera",
            })),
        );

        setStatus("ready");

        const loop = () => {
          const v = videoRef.current;
          const det = detectorRef.current;
          if (!v || !det || v.readyState < 2) {
            rafRef.current = requestAnimationFrame(loop);
            return;
          }
          const vw = v.videoWidth || 1;
          const vh = v.videoHeight || 1;
          const result = det.detectForVideo(v, performance.now());
          const next: FaceBox[] = result.detections.map((d) => {
            const b = d.boundingBox!;
            return {
              x: b.originX / vw,
              y: b.originY / vh,
              width: b.width / vw,
              height: b.height / vh,
            };
          });
          setFaces(next);
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        if (cancelled) return;
        // Release the camera if we failed after the stream was opened (e.g.
        // video.play() rejected) so the camera light doesn't stay on behind
        // the error screen.
        stopCamera();
        const name = (err as DOMException)?.name;
        if (name === "NotAllowedError" || name === "SecurityError") {
          setStatus("denied");
        } else if (
          name === "NotFoundError" ||
          name === "OverconstrainedError"
        ) {
          setStatus("no-camera");
        } else {
          setStatus("error");
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      stopCamera();
      if (detectorRef.current) {
        detectorRef.current.close();
        detectorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, selectedDeviceId, restartKey, stopCamera]);

  return {
    videoRef,
    status,
    faces,
    videoSize,
    devices,
    selectedDeviceId,
    activeDeviceId,
    selectDevice,
    retry,
  };
}
