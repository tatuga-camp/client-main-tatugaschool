import { ErrorMessages, School } from "@/interfaces";
import {
  getSignedURLTeacherService,
  RequestUpdateSchoolService,
  UploadSignURLService,
} from "@/services";
import { UseMutationResult } from "@tanstack/react-query";
import Image from "next/image";
import { ProgressBar } from "primereact/progressbar";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { defaultBlurHash } from "../../data";
import { decodeBlurhashToCanvas } from "../../utils";
import useGetRoleOnSchool from "../../hook/useGetRoleOnSchool";

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
  const role = useGetRoleOnSchool({
    schoolId: school.id,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(school.logo);

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
        schoolId: school.id,
        fileSize: file.size,
      });

      await updateSchool.mutateAsync({
        query: { schoolId: school.id },
        body: {},
      });
      await UploadSignURLService({ contentType: file.type, file, signURL });

      setPreviewUrl(originalURL);
      await updateSchool.mutateAsync({
        query: { schoolId: school.id },
        body: { logo: originalURL },
      });

      Swal.fire("Success", "Logo uploaded successfully!", "success");
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something Went Wrong",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
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
            sizes="(max-width: 768px) 100vw, 33vw"
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
            disabled={role === "TEACHER"}
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
      {role === "TEACHER" && (
        <span className="text-red-600">
          You are not allow to make any change because you are not an admin.
        </span>
      )}
    </div>
  );
};

export default ProfileUpload;
