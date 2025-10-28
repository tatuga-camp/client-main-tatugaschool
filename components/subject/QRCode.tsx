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
          ? "flex h-screen w-screen items-center justify-center"
          : "w-7/12 md:h-4/6"
      } relative flex flex-col gap-2 bg-white p-4 sm:p-6 md:p-8`}
    >
      <header className="absolute right-10 top-10 z-20 flex w-full items-center justify-end gap-2">
        <button
          onClick={() => setTriggerFullScreen((prev) => !prev)}
          className="second-button flex h-6 w-6 items-center justify-center gap-1 text-2xl"
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
          className="text-2xl text-red-500"
          onClick={() => {
            document.body.style.overflow = "auto";
            setTriggerQRCode(false);
          }}
        >
          <IoMdClose />
        </button>
      </header>
      <div className="relative h-64 w-full sm:h-80 md:h-96">
        {qrCode ? (
          <Image src={qrCode} alt="QR Code" layout="fill" objectFit="contain" />
        ) : (
          <div className="h-full w-full animate-pulse bg-gray-400"></div>
        )}
      </div>
      {expireAt && (
        <div className="flex w-full flex-col items-center justify-center">
          <h1 className="text-center text-xl font-semibold sm:text-2xl md:text-2xl">
            Expire In
          </h1>
          <Countdown
            date={expireAt}
            renderer={(props) => {
              return (
                <div className="rounded-2xl bg-gradient-to-r from-rose-400 to-red-500 px-2 text-2xl text-white">
                  {props.days}:{props.hours}:{props.minutes}:{props.seconds}
                </div>
              );
            }}
          />
        </div>
      )}
      {code && (
        <div className="flex flex-col items-center justify-center gap-1">
          <h1 className="text-center text-xl font-semibold sm:text-2xl md:text-3xl">
            {code}
          </h1>
          <p className="text-center text-xs text-gray-500 sm:text-sm md:text-base">
            Subject code for student to join
          </p>
        </div>
      )}
    </div>
  );
}

export default QRCode;
