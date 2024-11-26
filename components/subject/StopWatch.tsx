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
            className={`
  ${
    props.total < 6
      ? "bg-gradient-to-r from-pink-500 to-rose-500 "
      : "gradient-bg "
  }  pt-8 w-full h-full p-2 gap-2`}
          >
            <main className="w-full mt-2 h-full grid">
              <section className="flex justify-center items-center gap-2">
                <div className="w-full h-full text-5xl sm:text-6xl md:text-7xl flex items-center justify-center rounded-md bg-white">
                  {props.hours}:{props.minutes}:{props.seconds}
                </div>
              </section>
              <section className="flex gap-2 justify-center items-center flex-col">
                <div className="w-full flex items-center justify-center gap-2">
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
                <div className="w-full flex justify-center gap-2">
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
          ? "w-10/12 h-5/6 top-0 right-0 left-0 bottom-0 m-auto"
          : "w-72 sm:w-80 md:w-96 h-60 bottom-5 right-5 m-auto"
      } transition-height fixed rounded-xl overflow-hidden z-50`}
    >
      <div className="flex gap-2 top-2 right-2 m-auto absolute">
        <button
          title="full screen"
          className="flex items-center justify-center w-5 h-5 text-white rounded-md border border-white"
          onClick={() => {
            setTriggerFull((prev) => !prev);
          }}
        >
          {triggerFull ? <MdFullscreenExit /> : <MdFullscreen />}
        </button>
        <button
          className="flex items-center justify-center w-5 h-5 text-white rounded-md border border-white"
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
