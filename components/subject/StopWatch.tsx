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

function StopWatch({ onClose }: Props) {
  const alert = useSound("/sounds/ringing.mp3");
  const [triggerFull, setTriggerFull] = React.useState(false);
  const [time, setTime] = React.useState(10000);
  const [minutes, setMinutes] = React.useState(0);
  const [seconds, setSeconds] = React.useState(10);
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
            className={`${
              triggerFull
                ? "w-10/12 h-5/6 top-0 right-0 left-0 bottom-0 m-auto"
                : "w-96 h-60  bottom-5 right-5 m-auto"
            }  transition-height ${
              props.seconds < 6
                ? "bg-gradient-to-r from-pink-500 to-rose-500 "
                : "gradient-bg "
            } fixed rounded-xl overflow-hidden  z-50 " pt-8  p-2 gap-2`}
          >
            <div className="flex gap-2 top-2 right-2 m-auto absolute">
              <button
                title="full screen"
                className="flex items-center  
               justify-center w-5 h-5 text-white rounded-md border border-white"
                onClick={() => {
                  setTriggerFull((prev) => !prev);
                }}
              >
                {triggerFull ? <MdFullscreenExit /> : <MdFullscreen />}
              </button>
              <button
                className="flex items-center  
               justify-center w-5 h-5 text-white rounded-md border border-white"
                onClick={onClose}
              >
                <IoMdClose />
              </button>
            </div>
            <main className="w-full mt-2 place  h-full grid">
              <section className="flex   justify-center items-center gap-2">
                <div className="w-full h-full flex items-center justify-center rounded-md bg-white">
                  <h1
                    className={`text-center ${
                      triggerFull ? "text-9xl" : "text-6xl"
                    } `}
                  >
                    {props.hours}
                  </h1>
                  <h1
                    className={`text-center ${
                      triggerFull ? "text-9xl" : "text-6xl"
                    } `}
                  >
                    :
                  </h1>
                  <h1
                    className={`text-center ${
                      triggerFull ? "text-9xl" : "text-6xl"
                    } `}
                  >
                    {props.minutes}
                  </h1>
                  <h1
                    className={`text-center ${
                      triggerFull ? "text-9xl" : "text-6xl"
                    } `}
                  >
                    :
                  </h1>
                  <h1
                    className={`text-center ${
                      triggerFull ? "text-9xl" : "text-6xl"
                    } `}
                  >
                    {props.seconds}
                  </h1>
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
                  <div className="w-40">
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
                  <div className="w-40">
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
}

export default memo(StopWatch);
