import React, { useState } from "react";
import Image from "next/image";
import { School } from "@/interfaces";
import { ProgressBar } from "primereact/progressbar";
import Swal from "sweetalert2";
import {
  getSignedURLTeacherService,
  RequestUpdateSchoolService,
  UploadSignURLService,
} from "@/services";
import { UseMutationResult } from "@tanstack/react-query";
import { defaultBlurHash, defaultCanvas } from "../../data";
import { decodeBlurhashToCanvas } from "../../utils";

const ProfileUpload: React.FC<{
  school: School;
  updateSchool: UseMutationResult<
    School,
    Error,
    RequestUpdateSchoolService,
    unknown
  >;
}> = ({ school, updateSchool }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(school.logo);

  const handleUpload = async (url: string) => {
    if (!url) return;
    await updateSchool.mutateAsync({
      query: { schoolId: school.id },
      body: { logo: url },
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    const maxSize = 3.1 * 1024 * 1024; // 3.1 MB in bytes
    if (file.size > maxSize) {
      Swal.fire("Error", "File size exceeds 3.1 MB limit", "error");
      return;
    }

    try {
      setLoading(true);
      const { signURL, originalURL } = await getSignedURLTeacherService({
        fileName: file.name,
        fileType: file.type,
      });

      await UploadSignURLService({ contentType: file.type, file, signURL });

      setPreviewUrl(originalURL);

      await handleUpload(originalURL);

      Swal.fire("Success", "Logo uploaded successfully!", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to upload logo", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl text-center">
      <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-2 border-dashed border-gray-300">
        <div className="w-full h-full p-5 relative">
          <Image
            src={school?.logo ?? previewUrl}
            layout="fill"
            blurDataURL={decodeBlurhashToCanvas(
              school?.blurHash || defaultBlurHash
            )}
            placeholder="blur"
            objectFit="contain"
            alt="School Icon"
          />
        </div>

        <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            aria-label="Upload school logo"
            onChange={handleFileChange}
          />
        </label>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Allowed *.jpeg, *.jpg, *.png, *.gif
        <br />
        Max size of 3.1 MB
      </div>

      {loading && (
        <ProgressBar
          mode="indeterminate"
          style={{ height: "6px", width: "100%" }}
        />
      )}
    </div>
  );
};

export default ProfileUpload;
