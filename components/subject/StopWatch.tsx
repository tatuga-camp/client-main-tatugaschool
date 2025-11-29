import React, { memo, useEffect, useState } from "react";
import Countdown, { CountdownRenderProps } from "react-countdown";
import InputNumber from "../common/InputNumber";
import { IoMdClose } from "react-icons/io";
import {
  FaPlayCircle,
  FaRedo,
  FaRegStopCircle,
  FaPauseCircle,
} from "react-icons/fa";
import { useSound } from "../../hook";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

type Props = {
  onClose: () => void;
};

// Helper button component for adding time
const AddTimeButton = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/30 active:scale-95 sm:text-sm"
  >
    {label}
  </button>
);

const MemoizedCountdown = memo(() => {
  const [time, setTime] = React.useState(10000); // Duration in ms
  const [minutes, setMinutes] = React.useState(0);
  const [seconds, setSeconds] = React.useState(10);
  const [autoStart, setAutoStart] = React.useState(false);
  const alert = useSound("/sounds/ringing.mp3");

  const handleAddTime = (
    currentTotal: number,
    amountMs: number,
    isRunning: boolean,
  ) => {
    const newTotal = currentTotal + amountMs;
    setTime(newTotal);

    // Update inputs to match the new total time roughly
    const totalSec = Math.ceil(newTotal / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    setMinutes(m);
    setSeconds(s);

    // Maintain running state
    setAutoStart(isRunning);
  };

  return (
    <Countdown
      autoStart={autoStart}
      date={Date.now() + time}
      intervalDelay={0}
      precision={0}
      renderer={(props: CountdownRenderProps) => {
        if (props.api.isCompleted() && props.total === 0) {
          alert?.play();
        }

        // Determine if the timer is currently active (running)
        const isRunning =
          props.api.isStarted() &&
          !props.api.isPaused() &&
          !props.api.isStopped();

        return (
          <div
            className={`flex h-full w-full flex-col items-center justify-between gap-4 overflow-y-auto p-4 pt-10 transition-colors duration-500 ${
              props.total < 6000
                ? "bg-gradient-to-br from-pink-600 to-rose-600"
                : "bg-gradient-to-br from-cyan-500 to-blue-600"
            }`}
          >
            {/* Timer Display */}
            <div className="flex flex-1 items-center justify-center">
              <div className="flex items-center justify-center rounded-3xl bg-white/90 px-6 py-4 text-6xl font-bold text-gray-800 shadow-2xl backdrop-blur-sm sm:text-7xl md:px-10 md:text-8xl lg:text-9xl">
                {props.formatted.minutes}:{props.formatted.seconds}
              </div>
            </div>

            {/* Controls Container */}
            <div className="flex w-full max-w-2xl flex-col gap-4 rounded-2xl bg-black/10 p-4 backdrop-blur-md">
              {/* Play/Pause/Reset Controls */}
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                {!isRunning ? (
                  <button
                    onClick={() => {
                      props.api.start();
                      setAutoStart(true);
                    }}
                    title="Start"
                    className="group flex items-center justify-center rounded-full bg-white p-3 text-green-500 shadow-lg transition hover:scale-110 hover:text-green-600 sm:p-4"
                  >
                    <FaPlayCircle size={32} className="sm:text-4xl" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      props.api.pause();
                      setAutoStart(false);
                    }}
                    title="Pause"
                    className="group flex items-center justify-center rounded-full bg-white p-3 text-yellow-500 shadow-lg transition hover:scale-110 hover:text-yellow-600 sm:p-4"
                  >
                    <FaPauseCircle size={32} className="sm:text-4xl" />
                  </button>
                )}

                <button
                  onClick={() => {
                    props.api.stop();
                    setAutoStart(false);
                  }}
                  title="Reset"
                  className="group flex items-center justify-center rounded-full bg-white p-3 text-red-500 shadow-lg transition hover:scale-110 hover:text-red-600 sm:p-4"
                >
                  <FaRedo size={24} className="sm:text-3xl" />
                </button>
              </div>

              {/* Add Time Buttons */}
              <div className="flex flex-col gap-2 border-t border-white/10 pt-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="mr-1 text-xs font-medium uppercase tracking-wider text-white/80">
                    Sec:
                  </span>
                  <AddTimeButton
                    label="+5s"
                    onClick={() => handleAddTime(props.total, 5000, isRunning)}
                  />
                  <AddTimeButton
                    label="+10s"
                    onClick={() => handleAddTime(props.total, 10000, isRunning)}
                  />
                  <AddTimeButton
                    label="+30s"
                    onClick={() => handleAddTime(props.total, 30000, isRunning)}
                  />
                </div>
              </div>

              {/* Manual Input Setup */}
              <div className="flex flex-col items-center justify-center gap-2 border-t border-white/10 pt-2 sm:flex-row sm:gap-4">
                <div className="w-32 sm:w-40">
                  <InputNumber
                    min={0}
                    max={120}
                    value={minutes}
                    onValueChange={(value) => {
                      setMinutes(value);
                      setTime(value * 60000 + seconds * 1000);
                      setAutoStart(false);
                    }}
                    prefix="Minutes: "
                  />
                </div>
                <div className="w-32 sm:w-40">
                  <InputNumber
                    min={0}
                    max={60}
                    value={seconds}
                    onValueChange={(value) => {
                      setSeconds(value);
                      setTime(minutes * 60000 + value * 1000);
                      setAutoStart(false);
                    }}
                    prefix="Seconds: "
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
});
MemoizedCountdown.displayName = "MemoizedCountdown";

function StopWatch({ onClose }: Props) {
  const [triggerFull, setTriggerFull] = React.useState(false);

  return (
    <div
      className={`fixed z-50 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ease-in-out ${
        triggerFull
          ? "inset-0 m-0 h-full w-full rounded-none"
          : "bottom-5 right-5 h-[550px] rounded-xl"
      }`}
    >
      {/* Header Controls (Fullscreen / Close) */}
      <div className="absolute right-4 top-4 z-50 flex gap-2">
        <button
          title={triggerFull ? "Exit Fullscreen" : "Fullscreen"}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/40 active:scale-95"
          onClick={() => setTriggerFull((prev) => !prev)}
        >
          {triggerFull ? (
            <MdFullscreenExit size={20} />
          ) : (
            <MdFullscreen size={20} />
          )}
        </button>
        <button
          title="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-red-500 hover:text-white active:scale-95"
          onClick={onClose}
        >
          <IoMdClose size={20} />
        </button>
      </div>

      <MemoizedCountdown />
    </div>
  );
}

export default memo(StopWatch);
