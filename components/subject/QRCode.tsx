import React from "react";
import * as qrcode from "qrcode";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";

type Props = {
  url: string;
  code: string;
  setTriggerQRCode: (visible: boolean) => void;
};

function QRCode({ url, code, setTriggerQRCode }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
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
    <div className="w-full h-full flex flex-col gap-2 p-4 sm:p-6 md:p-8">
      <button
        className="self-end text-red-500"
        onClick={() => setTriggerQRCode(false)}
      >
        <IoMdClose />
      </button>
      <div className="w-full h-64 sm:h-80 md:h-96 relative">
        {qrCode ? (
          <Image src={qrCode} alt="QR Code" layout="fill" objectFit="contain" />
        ) : (
          <div className="w-full h-full bg-gray-400 animate-pulse"></div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center gap-1">
        <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-semibold">{code}</h1>
        <p className="text-center text-xs sm:text-sm md:text-base text-gray-500">
          Subject code for student to join
        </p>
      </div>
    </div>
  );
}

export default QRCode;
