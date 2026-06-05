import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaCog,
  FaTimes,
  FaBook,
  FaComment,
  FaUsers,
  FaMusic,
  FaHistory,
  FaTrash,
  FaSlidersH,
} from "react-icons/fa";
import { IoMdWarning } from "react-icons/io";
import { useSound } from "../../hook";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type NoisyDetectorProps = {
  onClose: () => void;
};

type AlertRecord = {
  id: number;
  timestamp: string;
  volume: number;
  limit: number;
};

type LevelConfig = {
  name: string;
  icon: React.ReactNode;
  activeClass: string;
} & ({ type: "preset"; limit: number } | { type: "custom" });

const CUSTOM_LIMIT_STORAGE_KEY = "noisyDetector.customLimit";

// The noise must stay above the limit continuously for this long before alerting.
const SUSTAIN_DURATION_MS = 5000;
// After an alert fires, wait this long before firing again while noise stays loud.
const RETRIGGER_COOLDOWN_MS = 5000;
// Tolerate brief dips below the limit (e.g. the gaps between words) for this long
// before resetting the sustain timer. Without this, the loudest-bin metric's
// frame-to-frame flicker keeps snapping the build-up back to zero.
const BELOW_LIMIT_GRACE_MS = 400;

const LEVELS: LevelConfig[] = [
  {
    type: "preset",
    name: "Silent",
    limit: 30,
    icon: <FaBook />,
    activeClass: "bg-pink-500 text-white shadow-pink-500/30",
  },
  {
    type: "preset",
    name: "Whisper",
    limit: 50,
    icon: <FaComment />,
    activeClass: "bg-orange-500 text-white shadow-orange-500/30",
  },
  {
    type: "preset",
    name: "Group",
    limit: 80,
    icon: <FaUsers />,
    activeClass: "bg-blue-500 text-white shadow-blue-500/30",
  },
  {
    type: "preset",
    name: "Party",
    limit: 95,
    icon: <FaMusic />,
    activeClass: "bg-green-500 text-white shadow-green-500/30",
  },
  {
    type: "custom",
    name: "Custom",
    icon: <FaSlidersH />,
    activeClass: "bg-purple-500 text-white shadow-purple-500/30",
  },
];

const NoisyDetector = ({ onClose }: NoisyDetectorProps) => {
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [presetLimit, setPresetLimit] = useState(80); // 0-100 scale
  const [customLimit, setCustomLimit] = useState<number>(() => {
    if (typeof window === "undefined") return 70;
    const saved = window.localStorage.getItem(CUSTOM_LIMIT_STORAGE_KEY);
    const n = saved !== null ? parseInt(saved, 10) : NaN;
    return !isNaN(n) && n >= 0 && n <= 100 ? n : 70;
  });
  const noiseLimit = mode === "custom" ? customLimit : presetLimit;
  const [currentVolume, setCurrentVolume] = useState(0);
  const [isAlerting, setIsAlerting] = useState(false);
  // 0 -> 1 progress through the 5s sustain window before the alarm fires.
  const [buildupProgress, setBuildupProgress] = useState(0);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const updateRef = useRef<() => void>();

  // Using more bins for "many bars" effect
  const [audioData, setAudioData] = useState<number[]>(new Array(64).fill(0));

  // Timestamp when the noise first started continuously exceeding the limit.
  // 0 means the noise is currently below the limit (timer not running).
  const exceedSince = useRef<number>(0);
  // Earliest time the alert is allowed to fire again (re-trigger cooldown).
  const cooldownUntil = useRef<number>(0);
  // Timestamp when the noise dropped below the limit, for the dip grace window.
  // 0 means the noise is currently at/above the limit.
  const belowSince = useRef<number>(0);
  const alertSound = useSound("/sounds/ringing.mp3");
  const lastAlertTime = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Persist customLimit across sessions
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CUSTOM_LIMIT_STORAGE_KEY, String(customLimit));
  }, [customLimit]);

  const startListening = async () => {
    try {
      // Check support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support microphone access.");
        return;
      }

      // 1. Request permission explicitly via getUserMedia
      // We do this FIRST to ensure we are as close as possible to the user gesture
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Create AudioContext immediately
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      // 3. Resume context if suspended (iOS Safari often starts suspended)
      // Note: If the user just granted permission in step 1, that interaction counts as a gesture.
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      analyserRef.current = audioCtx.createAnalyser();
      sourceRef.current = audioCtx.createMediaStreamSource(stream);

      // Configure analyser for frequency data
      analyserRef.current.fftSize = 256; // Results in 128 frequency bins
      // We can smooth the bars a bit
      analyserRef.current.smoothingTimeConstant = 0.5;

      sourceRef.current.connect(analyserRef.current);

      setIsListening(true);
      // Start the loop
      requestAnimationFrame(() => updateRef.current?.());
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");

      // Clean up if permission denied or error occurred
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  const stopListening = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    // Stop all tracks on the stream
    if (sourceRef.current) {
      const stream = sourceRef.current.mediaStream;
      stream.getTracks().forEach((track) => track.stop());
      sourceRef.current = null;
    }
    setIsListening(false);
    setIsAlerting(false);
    setBuildupProgress(0);
    setCurrentVolume(0);
    setAudioData(new Array(64).fill(0));
    exceedSince.current = 0;
    belowSince.current = 0;
    cooldownUntil.current = 0;
  };

  const clearHistory = () => {
    setAlerts([]);
  };

  const update = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    // Use Frequency Data for "bars" visualization
    analyserRef.current.getByteFrequencyData(dataArray);

    // Loudness = the loudest frequency bin, on a 0-100 scale. We use the peak
    // rather than the average across all bins because the average is diluted by
    // the many near-silent high-frequency bins (it sits at ~5-20% even for loud
    // talking) and would almost never reach the preset limits. The Volume meter
    // and the alarm both read this same value, so they always agree.
    let maxVal = 0;
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxVal) maxVal = dataArray[i];
    }
    const volume = Math.round((maxVal / 255) * 100);

    const now = Date.now();

    const isExceeding = volume > noiseLimit;

    if (isExceeding) {
      // At/above the limit: start the sustain timer on the first frame and
      // cancel any in-progress dip grace.
      if (exceedSince.current === 0) {
        exceedSince.current = now;
      }
      belowSince.current = 0;
    } else if (exceedSince.current !== 0) {
      // Below the limit while a sustain timer is running. Only reset it once the
      // noise has stayed below the limit continuously for the grace period -
      // brief dips between words shouldn't restart the 5s count.
      if (belowSince.current === 0) {
        belowSince.current = now;
      }
      if (now - belowSince.current >= BELOW_LIMIT_GRACE_MS) {
        exceedSince.current = 0;
        belowSince.current = 0;
      }
    }

    // Drive the build-up bar and the alarm from the sustain timer.
    if (exceedSince.current !== 0) {
      const elapsed = now - exceedSince.current;
      // How far into the 5s sustain window we are (0 -> 1), for the build-up bar.
      setBuildupProgress(Math.min(elapsed / SUSTAIN_DURATION_MS, 1));

      // Only alert once the noise has stayed above the limit long enough.
      if (elapsed >= SUSTAIN_DURATION_MS) {
        setIsAlerting(true);

        // Throttle repeat alerts while the noise stays loud.
        if (now >= cooldownUntil.current) {
          triggerAlert(volume);
          cooldownUntil.current = now + RETRIGGER_COOLDOWN_MS;
        }
      }
    } else {
      setBuildupProgress(0);
      setIsAlerting(false);
    }

    // Keep the chart live at all times so the user can watch the noise build up.
    setCurrentVolume(volume);
    setAudioData(Array.from(dataArray).slice(0, 64));

    // Schedule next frame using the ref to ensure fresh closure
    animationRef.current = requestAnimationFrame(() => updateRef.current?.());
  };

  // Keep updateRef current
  useEffect(() => {
    updateRef.current = update;
  });

  const triggerAlert = (volume: number) => {
    const now = Date.now();
    // Debounce sound alert
    if (now - lastAlertTime.current > 1000) {
      alertSound?.play();
      lastAlertTime.current = now;

      const newAlert: AlertRecord = {
        id: now,
        timestamp: new Date().toLocaleTimeString(),
        volume: volume,
        limit: noiseLimit,
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50)); // Limit history to 50 items
    }
  };

  // Chart Configuration
  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // Disable animation for realtime performance
    },
    scales: {
      y: {
        min: 0,
        max: 255,
        display: false,
        grid: { display: false },
      },
      x: {
        display: false,
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  const chartDataConfig: ChartData<"bar"> = {
    labels: new Array(audioData.length).fill(""),
    datasets: [
      {
        label: "Frequency",
        data: audioData,
        backgroundColor: isAlerting
          ? "rgba(239, 68, 68, 0.8)" // Red when alerting
          : (context) => {
              // Gradient or dynamic color based on height?
              const value = context.raw as number;
              const threshold = (noiseLimit / 100) * 255;
              return value > threshold
                ? "rgba(239, 68, 68, 0.8)"
                : "rgba(59, 130, 246, 0.6)";
            },
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  console.log(buildupProgress);
  return (
    <div
      className={`fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-between p-6 transition-colors duration-300 ${isAlerting ? "bg-red-400" : "bg-white"}`}
    >
      {/* Header */}
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h2 className="flex items-center gap-2 text-3xl font-bold text-gray-800">
              {isAlerting ? (
                <IoMdWarning className="animate-pulse text-red-600" />
              ) : (
                <FaVolumeUp className="text-blue-500" />
              )}
              Noise Detector
            </h2>
            {isAlerting && (
              <span className="animate-bounce rounded-full bg-red-500 px-4 py-1 text-sm font-bold text-white shadow-md">
                TOO LOUD!
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-gray-200 p-3 text-gray-600 transition-colors hover:bg-red-500 hover:text-white"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Build-up indicator: fills over the 5s the noise must stay above
            the limit before the alarm fires. Hidden once it actually fires. */}

        <div className="flex items-center gap-3 px-4">
          <IoMdWarning className="shrink-0 animate-pulse text-amber-500" />
          <span className="shrink-0 text-sm font-bold text-amber-600">
            Getting loud…
          </span>

          <span className="shrink-0 font-mono text-sm font-bold text-amber-600">
            {Math.ceil((SUSTAIN_DURATION_MS / 1000) * (1 - buildupProgress))}s
          </span>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="relative flex w-full flex-1 gap-4 overflow-hidden px-4 py-4">
        {/* Chart Section */}
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-inner">
          {!isListening ? (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <FaMicrophoneSlash size={64} className="mb-4 opacity-20" />
              <p className="text-xl">Click Start to detect noise</p>
            </div>
          ) : (
            <div className="relative h-full w-full px-4 pb-4 pt-8">
              {/* Threshold Line */}
              <div
                className="absolute left-0 z-10 w-full border-t-4 border-dashed border-red-500 opacity-70 transition-all duration-300"
                style={{
                  bottom: `${noiseLimit}%`,
                  left: 0,
                  right: 0,
                }}
              >
                <span className="absolute -top-8 right-0 rounded bg-red-100 px-2 py-1 text-sm font-bold text-red-600">
                  Limit: {noiseLimit}%
                </span>
              </div>

              <Bar options={chartOptions} data={chartDataConfig} />
            </div>
          )}
        </div>

        {/* Alert History Table */}
        <div className="flex w-80 flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-3">
            <h3 className="flex items-center gap-2 font-bold text-gray-700">
              <FaHistory className="text-blue-500" />
              Noise Log
            </h3>
            {alerts.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
              >
                <FaTrash /> Clear
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {alerts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-sm text-gray-400">
                <p>No alerts yet</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-gray-500">
                  <tr>
                    <th className="pb-2 pl-2">Time</th>
                    <th className="pb-2 text-right">Level</th>
                    <th className="pb-2 pr-2 text-right">Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-red-50"
                    >
                      <td className="py-2 pl-2 font-mono text-gray-600">
                        {alert.timestamp}
                      </td>
                      <td className="py-2 text-right font-bold text-red-500">
                        {alert.volume}%
                      </td>
                      <td className="py-2 pr-2 text-right text-gray-400">
                        {alert.limit}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex w-full max-w-4xl items-center justify-between rounded-2xl border-2 border-black bg-white p-2 ring-1 ring-gray-100">
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex min-w-[140px] items-center justify-center gap-2 rounded-xl px-3 py-1 text-lg font-bold transition-all ${
              isListening
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600"
                : "bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-600"
            }`}
          >
            {isListening ? (
              <>
                <FaMicrophoneSlash /> STOP
              </>
            ) : (
              <>
                <FaMicrophone /> START
              </>
            )}
          </button>

          <div className="flex-1 px-4">
            <div className="mb-2 flex items-center gap-2 font-bold text-gray-700">
              <FaCog className="text-gray-400" />
              <span>Sensitivity Mode</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {LEVELS.map((level) => {
                const isActive =
                  level.type === "custom"
                    ? mode === "custom"
                    : mode === "preset" && presetLimit === level.limit;
                return (
                  <button
                    key={level.name}
                    onClick={() => {
                      if (level.type === "custom") {
                        setMode("custom");
                      } else {
                        // Re-target detection live; noiseLimit is read fresh
                        // each frame, so no need to stop the mic.
                        setMode("preset");
                        setPresetLimit(level.limit);
                      }
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl py-2 transition-all duration-200 ${
                      isActive
                        ? `${level.activeClass} scale-105 shadow-lg`
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <span className="mb-1 text-xl">{level.icon}</span>
                    <span className="text-xs font-bold">{level.name}</span>
                  </button>
                );
              })}
            </div>
            {mode === "custom" && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">0</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={customLimit}
                  onChange={(e) => setCustomLimit(Number(e.target.value))}
                  className="flex-1 accent-purple-500"
                  aria-label="Custom noise limit"
                />
                <span className="text-xs font-bold text-gray-500">100</span>
                <span className="ml-2 min-w-[3.5rem] rounded bg-purple-100 px-2 py-1 text-center text-xs font-bold text-purple-700">
                  {customLimit}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Current Level Meter */}
        <div className="ml-8 flex w-24 flex-col items-center">
          <span className="mb-2 text-sm font-semibold text-gray-500">
            Volume
          </span>
          <div className="relative h-24 w-6 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
            <div
              className={`absolute bottom-0 w-full transition-all duration-100 ${currentVolume > noiseLimit ? "bg-red-500" : "bg-green-500"}`}
              style={{ height: `${currentVolume}%` }}
            />
          </div>
          <span className="mt-1 font-mono font-bold text-gray-700">
            {currentVolume}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoisyDetector;
