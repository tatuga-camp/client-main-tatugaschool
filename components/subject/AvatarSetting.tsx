import Image from "next/image";
import { Toast } from "primereact/toast";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { CgSelect } from "react-icons/cg";
import { MdPhoto } from "react-icons/md";
import { RxAvatar } from "react-icons/rx";
import Swal from "sweetalert2";
import { defaultBlurHash, studentAvatars } from "../../data";
import { ErrorMessages, StudentOnSubject } from "../../interfaces";
import { useUpdateStudentOnSubject } from "../../react-query";
import {
  getSignedURLTeacherService,
  UploadSignURLService,
} from "../../services";
import { generateBlurHash, urlToFile } from "../../utils";
import LoadingSpinner from "../common/LoadingSpinner";
import PhotoEditor from "../common/PhotoEditor";

type Props = {
  studentOnSubject: StudentOnSubject;
  toast: RefObject<Toast>;
  onUpdatePhoto: (url: string) => void;
  onClose: () => void;
};

function AvatarSetting({
  studentOnSubject,
  toast,
  onUpdatePhoto,
  onClose,
}: Props) {
  const [selectAvatar, setSelectAvatar] = useState<string>(
    studentOnSubject.photo,
  );
  const updateStudentOnSubject = useUpdateStudentOnSubject();
  const selectedAvatarRef = useRef<HTMLLIElement>(null);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  useEffect(() => {
    if (selectedAvatarRef.current) {
      selectedAvatarRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectAvatar]);

  const handleUpdateAvatar = async () => {
    try {
      setLoading(true);
      const file = await urlToFile(selectAvatar);
      if (!file) {
        const update = await updateStudentOnSubject.mutateAsync({
          query: {
            id: studentOnSubject.id,
          },
          data: {
            photo: selectAvatar,
            blurHash: defaultBlurHash,
          },
        });
        onUpdatePhoto(update.photo);
      } else {
        const blurHash = await generateBlurHash(file);
        const update = await updateStudentOnSubject.mutateAsync({
          query: {
            id: studentOnSubject.id,
          },
          data: {
            photo: selectAvatar,
            blurHash: blurHash,
          },
        });
        onUpdatePhoto(update.photo);
      }

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Update Success",
        life: 3000,
      });
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

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoFile(file);
  };

  const handleSavePhoto = async (file: File) => {
    try {
      setLoading(true);

      const signURL = await getSignedURLTeacherService({
        schoolId: studentOnSubject.schoolId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      await UploadSignURLService({
        signURL: signURL.signURL,
        file,
        contentType: file.type,
      });

      const blurHash = await generateBlurHash(file);

      await updateStudentOnSubject.mutateAsync({
        query: {
          id: studentOnSubject.id,
        },
        data: {
          photo: signURL.originalURL,
          blurHash: blurHash,
        },
      });
      onUpdatePhoto(signURL.originalURL);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Update Success",
        life: 3000,
      });
      setPhotoFile(null);
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

  return (
    <section className="flex h-96 w-full flex-col font-Anuphan">
      {photoFile && (
        <PhotoEditor
          file={photoFile}
          onClose={() => setPhotoFile(null)}
          onSave={handleSavePhoto}
        />
      )}
      <header className="flex w-full flex-col gap-1 border-b pb-1">
        <div className="flex items-center justify-start gap-2 text-xl font-semibold">
          <RxAvatar /> Avatar Setting
        </div>
        <span className="text-sm font-normal text-gray-500">
          You can change avatar or upload avatar here
        </span>
      </header>

      <ul className="grid h-full w-full grid-cols-3 place-items-center gap-2 overflow-auto bg-gray-100 p-3 sm:grid-cols-5">
        <label
          htmlFor="imageUpload"
          className={`relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white hover:scale-105`}
        >
          <MdPhoto className="text-5xl" />
          <span className="text-xs">Upload Photo</span>
        </label>
        <input
          onChange={handleUploadImage}
          type="file"
          className="hidden"
          id="imageUpload"
          name="image"
          accept="image/*"
        />

        {studentAvatars.map((url, index) => {
          const isSelected = selectAvatar === url;

          return (
            <li
              key={index}
              ref={isSelected ? selectedAvatarRef : null}
              className={`relative ${
                isSelected && "ring-2"
              } h-24 w-24 cursor-pointer overflow-hidden rounded-2xl bg-white hover:scale-105`}
              onClick={() => setSelectAvatar(url)}
            >
              <Image
                src={url}
                fill
                alt="student avatar"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </li>
          );
        })}
      </ul>

      <footer className="flex h-20 w-full items-center justify-end gap-2 border-t">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              onClose();
            }}
            type="button"
            className="second-button flex w-40 items-center justify-center gap-1 border"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleUpdateAvatar}
            className="main-button flex w-40 items-center justify-center gap-1"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <CgSelect /> Select
              </>
            )}
          </button>
        </div>
      </footer>
    </section>
  );
}

export default AvatarSetting;
