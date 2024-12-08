import Image from "next/image";
import React from "react";
import { User } from "@/interfaces";

const WelcomeCard = ({ user }: { user: User }) => {
  return (
    <div className="flex flex-col items-center p-6 rounded-lg w-full max-w-xs text-center space-y-4 z-0">
      <Image
        src="/svg/nav/illustration_docs.svg"
        alt="Welcome illustration"
        width={250}
        height={250}
        className="mb-4 z-0"
      />

      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Hi, {user.firstName} {user.lastName}
        </h2>
        <p className="text-gray-500 text-sm">
          Need help, <br />
          Please check our docs
        </p>
      </div>

      <button className="px-6 py-2 bg-primary-color text-white font-semibold rounded-lg hover:bg-primary-color-hover">
        Name Package
      </button>
    </div>
  );
};

export default WelcomeCard;
