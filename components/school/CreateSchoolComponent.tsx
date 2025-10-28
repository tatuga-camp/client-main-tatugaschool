import { ErrorMessages, School } from "@/interfaces";
import {
  CreateSchoolService,
  getSignedURLTeacherService,
  RequestCreateSchoolService,
  UploadSignURLService,
} from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import { ProgressBar } from "primereact/progressbar";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { FaRegAddressCard, FaUserPlus } from "react-icons/fa";
import { LuSchool } from "react-icons/lu";
import { PhoneInput } from "react-international-phone";
import styles from "@/styles/input-phone.module.css";
import Swal from "sweetalert2";
import { countries, defaultBlurHash } from "../../data";
import { decodeBlurhashToCanvas, generateBlurHash } from "../../utils";
import Dropdown from "../common/Dropdown";
import InviteJoinSchool from "./InviteJoinSchool";
import { useCreateSchool, useGetLanguage } from "../../react-query";
import { createSchoolDataLanguage } from "../../data/languages";

const CreateSchoolComponent = () => {
  const language = useGetLanguage();
  const menuItems: { title: string; icon: ReactNode }[] = [
    {
      title: createSchoolDataLanguage.profile(language.data ?? "en"),
      icon: <LuSchool />,
    },
    {
      title: createSchoolDataLanguage.address(language.data ?? "en"),
      icon: <FaRegAddressCard />,
    },
    {
      title: createSchoolDataLanguage.invite(language.data ?? "en"),
      icon: <FaUserPlus />,
    },
  ];
  const createSchool = useCreateSchool();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const inputClasses = "border rounded-2xl px-6 py-4";
  const [profile, setProfile] = useState<{
    school?: string;
    description?: string;
    logo?: string;
    blurHash?: string;
  }>();
  const [address, setAddress] = useState<{
    city?: string;
    address?: string;
    zipCode?: string;
    phoneNumber?: string;
  }>();

  const [country, setCountry] = useState<{
    name: string;
    code: string;
  }>();

  const show = () => {
    toast.current?.show({
      severity: "info",
      summary: "Created",
      detail: "School has been created",
    });
  };
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {
        throw new Error("File not found");
      }
      setLoading(true);
      const signURL = await getSignedURLTeacherService({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      const blurHash = await generateBlurHash(file);
      await UploadSignURLService({
        file: file,
        signURL: signURL.signURL,
        contentType: file.type,
      });

      setProfile((prev) => {
        return { ...prev, logo: signURL.originalURL, blurHash: blurHash };
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

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      if (
        !profile?.school ||
        !profile?.description ||
        !country ||
        !address?.city ||
        !address?.address ||
        !address?.zipCode ||
        !address?.phoneNumber
      ) {
        throw new Error(
          language.data === "en"
            ? "Please fill the form"
            : "โปรดกรอกข้อมูลให้ครบถ้วน",
        );
      }
      if (!profile?.logo) {
        throw new Error(
          language.data === "en"
            ? "Please upload logo of your school"
            : "กรุณาอัพโหลดรูปภาพ",
        );
      }

      await createSchool.mutateAsync({
        title: profile?.school,
        description: profile?.description,
        logo: profile?.logo,
        country: country?.name,
        city: address?.city,
        address: address?.address,
        zipCode: address?.zipCode,
        phoneNumber: address?.phoneNumber,
        blurHash: profile?.blurHash ?? defaultBlurHash,
      });
      show();
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
    }
  };

  const selectedCountryTemplate = (
    option: { name: string; code: string } | undefined,
    props: any,
  ) => {
    if (option) {
      return (
        <div className="align-items-center flex gap-5">
          <Image
            alt={option.name}
            src={`/svg/flags/1x1/${option.code.toLowerCase()}.svg`}
            width={20}
            height={10}
            style={{ width: "18px" }}
          />
          <div>{option.name}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const countryOptionTemplate = (
    option: { name: string; code: string } | undefined,
  ) => {
    if (!option) {
      return;
    }
    return (
      <div className="align-items-center flex gap-5">
        <Image
          alt={option.name}
          src={`/svg/flags/1x1/${option.code.toLowerCase()}.svg`}
          width={20}
          height={10}
          style={{ width: "18px" }}
        />
        <div>{option.name}</div>
      </div>
    );
  };

  const handleChangeActiveIndex = useCallback(
    (index: number) => {
      if (createSchool.isSuccess) {
        setActiveIndex(2);
      } else if (!createSchool.data && index === 2) {
        return null;
      } else {
        setActiveIndex(index);
      }
    },
    [createSchool.isSuccess, createSchool.data],
  );

  useEffect(() => {
    if (createSchool.status === "success") {
      handleChangeActiveIndex(2);
    }
  }, [createSchool.status, handleChangeActiveIndex]);
  return (
    <div className="mx-auto mb-10 flex w-full max-w-xl flex-col gap-2 rounded-3xl bg-white p-12 shadow-md">
      <Toast ref={toast}></Toast>
      <h2 className="text-center text-xl font-semibold text-black">
        {createSchoolDataLanguage.title(language.data ?? "en")}
      </h2>
      <ul className="flex items-center justify-center gap-x-10 py-5">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 ${
              activeIndex === index
                ? "text-primary-color"
                : "text-gray-400 hover:text-primary-color"
            } `}
            onClick={() => handleChangeActiveIndex(index)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border text-2xl">
              {item.icon}
            </div>
            <span className="text-sm font-semibold">{item.title}</span>
          </li>
        ))}
      </ul>

      <form ref={formRef} onSubmit={handleSubmit}>
        {activeIndex === 0 && (
          <section className="flex flex-col gap-2">
            <div className="flex w-full items-center justify-center">
              <label
                className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 ${loading && "animate-pulse"}`}
              >
                {profile?.logo ? (
                  <div className="relative h-full w-full p-5">
                    <Image
                      src={profile?.logo}
                      layout="fill"
                      blurDataURL={decodeBlurhashToCanvas(
                        profile?.blurHash || defaultBlurHash,
                      )}
                      placeholder="blur"
                      objectFit="contain"
                      alt="School Icon"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <svg
                      className="mb-4 h-8 w-8 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      {createSchoolDataLanguage.uploadTitle(
                        language.data ?? "en",
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG or GIF (MAX. 800x400px)
                    </p>
                  </div>
                )}

                <input
                  accept="image/*"
                  id="dropzone-file"
                  onChange={handleUploadImage}
                  type="file"
                  className="hidden"
                />
              </label>
            </div>
            {loading && (
              <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
            )}
            <div className="flex flex-col">
              <input
                required
                type="text"
                className={inputClasses}
                placeholder={createSchoolDataLanguage.school(
                  language.data ?? "en",
                )}
                aria-label="School Name"
                value={profile?.school}
                onChange={(e) =>
                  setProfile((prev) => {
                    return { ...prev, school: e.target.value };
                  })
                }
              />
            </div>
            <div className="flex flex-col">
              <input
                type="text"
                required
                className={inputClasses}
                placeholder={createSchoolDataLanguage.description(
                  language.data ?? "en",
                )}
                aria-label="School Description"
                value={profile?.description}
                onChange={(e) =>
                  setProfile((prev) => {
                    return { ...prev, description: e.target.value };
                  })
                }
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (formRef.current?.reportValidity()) {
                  handleChangeActiveIndex(1);
                }
              }}
              className="flex h-10 w-full items-center justify-center rounded-2xl bg-secondary-color py-2 font-semibold text-white transition duration-150 hover:bg-primary-color active:drop-shadow-md"
            >
              {createSchoolDataLanguage.button(language.data ?? "en")}
            </button>
          </section>
        )}

        {activeIndex === 1 && (
          <section className="flex w-full flex-col gap-2">
            <Dropdown<{ name: string; code: string } | undefined>
              value={country}
              onChange={(e) => setCountry(e.value)}
              options={countries}
              optionLabel="name"
              placeholder="Select a Country"
              valueTemplate={selectedCountryTemplate}
              itemTemplate={countryOptionTemplate}
            />
            <div className="flex flex-col">
              <input
                type="text"
                required
                className={inputClasses}
                placeholder="City"
                value={address?.city}
                onChange={(e) =>
                  setAddress((prev) => {
                    return { ...prev, city: e.target.value };
                  })
                }
              />
            </div>
            <div className="flex flex-col">
              <input
                type="text"
                required
                className={inputClasses}
                placeholder="Address"
                value={address?.address}
                onChange={(e) =>
                  setAddress((prev) => {
                    return { ...prev, address: e.target.value };
                  })
                }
              />
            </div>
            <div className="flex flex-col">
              <input
                type="text"
                required
                className={inputClasses}
                placeholder="Zip Code"
                value={address?.zipCode}
                onChange={(e) =>
                  setAddress((prev) => {
                    return { ...prev, zipCode: e.target.value };
                  })
                }
              />
            </div>
            <PhoneInput
              required
              defaultCountry="th"
              value={address?.phoneNumber}
              onChange={(phone) =>
                setAddress((prev) => {
                  return { ...prev, phoneNumber: phone as string };
                })
              }
            />
            <button
              disabled={createSchool.isPending}
              className={`w-full ${
                createSchool.isPending
                  ? "bg-white ring-1 ring-primary-color"
                  : "bg-secondary-color"
              } flex h-10 items-center justify-center rounded-2xl py-2 font-semibold text-white transition duration-150 hover:bg-primary-color active:drop-shadow-md`}
            >
              {createSchool.isPending ? (
                <ProgressSpinner
                  animationDuration="1s"
                  style={{ width: "20px" }}
                  className="h-5 w-5"
                  strokeWidth="8"
                />
              ) : (
                "Create"
              )}
            </button>
          </section>
        )}
      </form>

      {activeIndex === 2 && createSchool.data && (
        <InviteJoinSchool schoolId={createSchool.data.id} />
      )}
    </div>
  );
};

export default CreateSchoolComponent;
