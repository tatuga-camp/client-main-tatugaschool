import React from "react";
import * as qrcode from "qrcode";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import Countdown from "react-countdown";

type Props = {
  url: string;
  code?: string | undefined;
  setTriggerQRCode: (visible: boolean) => void;
  expireAt?: Date | undefined;
};

function QRCode({ url, code, setTriggerQRCode, expireAt }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [triggerFullScreen, setTriggerFullScreen] = React.useState(false);
  const [qrCode, setQRCode] = React.useState<string>();
  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      const qrCode = await qrcode.toDataURL(url, {
        errorCorrectionLevel: "M",
        rendererOpts: {
          quality: 1,
        },
        type: "image/webp",
      });
      setQRCode(qrCode);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    generateQRCode();
  }, []);

  return (
    <div
      className={`${
        triggerFullScreen
          ? "w-screen h-screen flex items-center justify-center"
          : "w-7/12 md:h-4/6"
      }  bg-white flex flex-col gap-2 p-4 relative  sm:p-6 md:p-8`}
    >
      <header className="w-full absolute z-20 top-10 right-10 flex justify-end gap-2 items-center">
        <button
          onClick={() => setTriggerFullScreen((prev) => !prev)}
          className="second-button text-2xl flex items-center w-6  h-6  justify-center gap-1 "
        >
          {triggerFullScreen ? (
            <div className="flex items-center justify-center gap-1">
              <MdFullscreenExit />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <MdFullscreen />
            </div>
          )}
        </button>
        <button
          className=" text-red-500 text-2xl"
          onClick={() => {
            document.body.style.overflow = "auto";
            setTriggerQRCode(false);
          }}
        >
          <IoMdClose />
        </button>
      </header>
      <div className="w-full h-64 sm:h-80 md:h-96 relative">
        {qrCode ? (
          <Image src={qrCode} alt="QR Code" layout="fill" objectFit="contain" />
        ) : (
          <div className="w-full h-full bg-gray-400 animate-pulse"></div>
        )}
      </div>
      {expireAt && (
        <div className="w-full flex flex-col items-center justify-center">
          <h1 className="text-center text-xl sm:text-2xl md:text-2xl font-semibold">
            Expire In
          </h1>
          <Countdown
            date={expireAt}
            renderer={(props) => {
              return (
                <div className="bg-gradient-to-r from-rose-400 to-red-500 text-2xl px-2 rounded-md text-white">
                  {props.days}:{props.hours}:{props.minutes}:{props.seconds}
                </div>
              );
            }}
          />
        </div>
      )}
      {code && (
        <div className="flex flex-col items-center justify-center gap-1">
          <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-semibold">
            {code}
          </h1>
          <p className="text-center text-xs sm:text-sm md:text-base text-gray-500">
            Subject code for student to join
          </p>
        </div>
      )}
    </div>
  );
}

export default QRCode;
