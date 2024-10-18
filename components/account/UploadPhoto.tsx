/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { getSignedURLTeacherService, UploadSignURLService } from "@/services";
import useUserStore from "@/store/userStore";
import useAccountStore from "@/store/accountStore";

import Swal from "sweetalert2";

export default function UploadPhoto() {
  const { user } = useUserStore();
  const { setSignURL, setOriginalURL } = useAccountStore();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      const { signURL, originalURL } = await getSignedURLTeacherService({
        fileName: file.name,
        fileType: file.type,
      });

      console.log(signURL);

      await UploadSignURLService({contentType: file.type, file, signURL});
      
      setSignURL(signURL);
      setOriginalURL(originalURL);
      setPreviewUrl(originalURL);

      Swal.fire("success", "Photo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      Swal.fire("error", "Failed to upload photo.");
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    setPreviewUrl(user?.photo);
  }, [user]);

  useEffect(() => {
    handleUpload();
  }, [file]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Preview"
            className="object-cover w-full h-full"
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

      {/* {file ? <button
        onClick={handleUpload}
        className="text-purple-600 hover:underline"
      >
        Update photo
      </button> : ''} */}

      <div className="text-center text-sm text-gray-600">
        <p>Allowed *.jpeg, *.jpg, *.png, *.gif</p>
        <p>Max size of 3.1 MB</p>
      </div>
    </div>
  );
}
