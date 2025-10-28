import React, { memo, useEffect } from "react";
import Countdown from "react-countdown";
import InputNumber from "../common/InputNumber";
import { IoMdClose } from "react-icons/io";
import { FaPlayCircle, FaRedo, FaRegStopCircle } from "react-icons/fa";
import { useSound } from "../../hook";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

type Props = {
  onClose: () => void;
};

const MemoizedCountdown = memo(() => {
  const [time, setTime] = React.useState(10000);
  const [minutes, setMinutes] = React.useState(0);
  const [seconds, setSeconds] = React.useState(10);
  const alert = useSound("/sounds/ringing.mp3");

  return (
    <Countdown
      autoStart={false}
      date={Date.now() + time}
      intervalDelay={0}
      precision={0}
      renderer={(props) => {
        if (props.api.isCompleted() && props.total === 0) {
          alert?.play();
        }
        return (
          <div
            className={` ${
              props.total < 6
                ? "bg-gradient-to-r from-pink-500 to-rose-500"
                : "gradient-bg"
            } h-full w-full gap-2 p-2 pt-8`}
          >
            <main className="mt-2 grid h-full w-full">
              <section className="flex items-center justify-center gap-2">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white text-5xl sm:text-6xl md:text-7xl">
                  {props.hours}:{props.minutes}:{props.seconds}
                </div>
              </section>
              <section className="flex flex-col items-center justify-center gap-2">
                <div className="flex w-full items-center justify-center gap-2">
                  {(props.api.isStopped() || props.api.isPaused()) && (
                    <button
                      onClick={() => {
                        props.api.start();
                      }}
                      title="start watch"
                      className="main-button p-2"
                    >
                      <FaPlayCircle />
                    </button>
                  )}

                  {props.api.isStarted() && (
                    <button
                      onClick={() => {
                        props.api.pause();
                      }}
                      title="start watch"
                      className="main-button p-2"
                    >
                      <FaRegStopCircle />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      props.api.stop();
                    }}
                    title="start watch"
                    className="main-button p-2"
                  >
                    <FaRedo />
                  </button>
                </div>
                <div className="flex w-full justify-center gap-2">
                  <div className="w-24 sm:w-32 md:w-40">
                    <InputNumber
                      min={0}
                      max={120}
                      value={minutes}
                      onValueChange={(value) => {
                        setMinutes(value);
                        setTime(value * 60000 + seconds * 1000);
                      }}
                      prefix="Minutes : "
                    />
                  </div>
                  <div className="w-24 sm:w-32 md:w-40">
                    <InputNumber
                      min={0}
                      max={60}
                      value={seconds}
                      onValueChange={(value) => {
                        setSeconds(value);
                        setTime(minutes * 60000 + value * 1000);
                      }}
                      prefix="Seconds : "
                    />
                  </div>
                </div>
              </section>
            </main>
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
      className={`${
        triggerFull
          ? "bottom-0 left-0 right-0 top-0 m-auto h-5/6 w-10/12"
          : "bottom-5 right-5 m-auto h-60 w-72 sm:w-80 md:w-96"
      } fixed z-50 overflow-hidden rounded-xl transition-height`}
    >
      <div className="absolute right-2 top-2 m-auto flex gap-2">
        <button
          title="full screen"
          className="flex h-5 w-5 items-center justify-center rounded-2xl border border-white text-white"
          onClick={() => {
            setTriggerFull((prev) => !prev);
          }}
        >
          {triggerFull ? <MdFullscreenExit /> : <MdFullscreen />}
        </button>
        <button
          className="flex h-5 w-5 items-center justify-center rounded-2xl border border-white text-white"
          onClick={onClose}
        >
          <IoMdClose />
        </button>
      </div>
      <MemoizedCountdown />
    </div>
  );
}

export default memo(StopWatch);
