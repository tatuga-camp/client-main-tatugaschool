import { useState, useEffect, memo } from "react";
import {
  getSignedURLTeacherService,
  RequestUpdateUserService,
  UploadSignURLService,
} from "@/services";

import Swal from "sweetalert2";
import { ErrorMessages, User } from "../../interfaces";
import Image from "next/image";
import { ProgressBar } from "primereact/progressbar";
import { UseMutationResult } from "@tanstack/react-query";

type Prosp = {
  updateUser: UseMutationResult<User, Error, RequestUpdateUserService, unknown>;
  user: User;
};
function UploadPhoto({ user, updateUser }: Prosp) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.photo);
  const [loading, setLoading] = useState(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const { signURL, originalURL } = await getSignedURLTeacherService({
        fileName: file.name,
        fileType: file.type,
      });

      await UploadSignURLService({ contentType: file.type, file, signURL });

      setPreviewUrl(originalURL);
      await updateUser.mutateAsync({
        photo: originalURL,
      });
      Swal.fire("success", "Photo uploaded successfully!");
      setLoading(false);
    } catch (error) {
      setLoading(false);
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
    }
  };

  useEffect(() => {
    handleUpload();
  }, [file]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className=" w-32 h-32 relative rounded-full overflow-hidden">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover "
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span>Preview</span>
          </div>
        )}
        <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      </div>
      {loading && (
        <ProgressBar
          mode="indeterminate"
          style={{ height: "6px", width: "100%" }}
        />
      )}
      <div className="text-center text-sm text-gray-600">
        <p>Allowed *.jpeg, *.jpg, *.png, *.gif</p>
        <p>Max size of 3.1 MB</p>
      </div>
    </div>
  );
}
export default memo(UploadPhoto);
