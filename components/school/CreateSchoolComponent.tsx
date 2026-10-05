import { ErrorMessages } from "@/interfaces";
import { getSignedURLTeacherService, UploadSignURLService } from "@/services";
import Image from "next/image";
import { useRef, useState } from "react";
import { LuImagePlus, LuMapPin, LuPhone } from "react-icons/lu";
import { MdCheck, MdErrorOutline } from "react-icons/md";
import { PhoneInput } from "react-international-phone";
import Swal from "sweetalert2";
import { countries, defaultBlurHash } from "../../data";
import { decodeBlurhashToCanvas, generateBlurHash } from "../../utils";
import InviteJoinSchool from "./InviteJoinSchool";
import { useCreateSchool, useGetLanguage } from "../../react-query";
import { createSchoolDataLanguage } from "../../data/languages";
import {
  describedBy,
  fieldInputClass,
  FormField,
} from "../common/FormField";

type ProfileField = "logo" | "school" | "description";
type AddressField = "country" | "address" | "city" | "zipCode" | "phoneNumber";

const PROFILE_FIELDS: ProfileField[] = ["logo", "school", "description"];
const ADDRESS_FIELDS: AddressField[] = [
  "country",
  "address",
  "city",
  "zipCode",
  "phoneNumber",
];

const CreateSchoolComponent = () => {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const createSchool = useCreateSchool();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // Errors appear once a field is left or its step is submitted.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submittedSteps, setSubmittedSteps] = useState<number[]>([]);

  const [profile, setProfile] = useState({
    school: "",
    description: "",
    logo: "",
    blurHash: "",
  });
  const [address, setAddress] = useState({
    // Almost every Tatuga school is in Thailand; start there.
    country: "Thailand",
    city: "",
    address: "",
    zipCode: "",
    phoneNumber: "",
  });

  const steps = [
    createSchoolDataLanguage.profile(lang),
    createSchoolDataLanguage.address(lang),
    createSchoolDataLanguage.invite(lang),
  ];
  const created = createSchool.isSuccess && !!createSchool.data;

  const required = (value: string) =>
    value.trim() ? null : createSchoolDataLanguage.required(lang);
  const errors: Record<ProfileField | AddressField, string | null> = {
    logo: profile.logo ? null : createSchoolDataLanguage.logoRequired(lang),
    school: required(profile.school),
    description: required(profile.description),
    country: required(address.country),
    address: required(address.address),
    city: required(address.city),
    zipCode: required(address.zipCode),
    // The phone value always carries the dial code, so count digits.
    phoneNumber:
      address.phoneNumber.replace(/\D/g, "").length >= 8
        ? null
        : createSchoolDataLanguage.invalidPhone(lang),
  };
  const visibleError = (field: ProfileField | AddressField, step: number) =>
    submittedSteps.includes(step) || touched[field] ? errors[field] : null;
  const touch = (field: string) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const focusField = (field: ProfileField | AddressField) =>
    document
      .getElementById(field === "logo" ? "school-logo-button" : `school-${field}`)
      ?.focus();

  // Returns true when every field of the step is valid; otherwise reveals the
  // step's errors and moves focus to the first problem.
  const validateStep = (step: number) => {
    setSubmittedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
    const fields = step === 0 ? PROFILE_FIELDS : ADDRESS_FIELDS;
    const firstInvalid = fields.find((field) => errors[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return false;
    }
    return true;
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clear the input so choosing the same file again still fires onChange.
    e.target.value = "";
    if (!file) return;
    try {
      setUploading(true);
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
      setProfile((prev) => ({
        ...prev,
        logo: signURL.originalURL,
        blurHash: blurHash,
      }));
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result?.error ? result.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex === 0) {
      if (validateStep(0)) setActiveIndex(1);
      return;
    }
    if (!validateStep(1) || createSchool.isPending) return;
    // The profile step can't be skipped, but re-check in case a field changed.
    if (PROFILE_FIELDS.some((field) => errors[field])) {
      setActiveIndex(0);
      return;
    }
    try {
      await createSchool.mutateAsync({
        title: profile.school.trim(),
        description: profile.description.trim(),
        logo: profile.logo,
        country: address.country,
        city: address.city.trim(),
        address: address.address.trim(),
        zipCode: address.zipCode.trim(),
        phoneNumber: address.phoneNumber,
        blurHash: profile.blurHash || defaultBlurHash,
      });
      setActiveIndex(2);
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result?.error ? result.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const hasPhone = address.phoneNumber.replace(/\D/g, "").length > 3;
  const location = [address.city.trim(), address.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold leading-tight text-icon-color sm:text-4xl">
          {createSchoolDataLanguage.title(lang)}
        </h1>
        <p className="mt-2 leading-relaxed text-icon-color/70">
          {createSchoolDataLanguage.subtitle(lang)}
        </p>
      </header>

      <nav aria-label={createSchoolDataLanguage.title(lang)} className="mt-8">
        <ol className="flex items-start">
          {steps.map((label, index) => {
            const done = index < activeIndex || (created && index < 2);
            const current = index === activeIndex;
            // Completed steps stay reachable until the school exists.
            const canVisit = !created && index < activeIndex;
            const marker = (
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  done
                    ? "bg-primary-color text-white"
                    : current
                      ? "border-2 border-primary-color bg-white text-primary-color"
                      : "border border-icon-color/20 bg-white text-icon-color/50"
                }`}
              >
                {done ? <MdCheck aria-hidden className="text-lg" /> : index + 1}
              </span>
            );
            const text = (
              <span
                className={`text-xs leading-snug sm:text-sm ${
                  current
                    ? "font-semibold text-icon-color"
                    : done
                      ? "font-medium text-icon-color/80"
                      : "text-icon-color/50"
                }`}
              >
                {label}
              </span>
            );
            return (
              <li
                key={label}
                aria-current={current ? "step" : undefined}
                className="relative flex flex-1 flex-col items-center text-center sm:flex-row sm:gap-3 sm:text-left sm:last:flex-none"
              >
                {index > 0 && (
                  <span
                    aria-hidden
                    className={`absolute right-[calc(50%+1.5rem)] top-[1.125rem] h-0.5 w-[calc(100%-3rem)] rounded-full sm:hidden ${
                      done || current ? "bg-primary-color" : "bg-icon-color/15"
                    }`}
                  />
                )}
                {canVisit ? (
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="flex flex-col items-center gap-2 rounded-xl sm:flex-row sm:gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/20"
                  >
                    {marker}
                    {text}
                  </button>
                ) : (
                  <span className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
                    {marker}
                    {text}
                  </span>
                )}
                {index < steps.length - 1 && (
                  <span
                    aria-hidden
                    className={`mx-3 hidden h-0.5 flex-1 rounded-full sm:block ${
                      done ? "bg-primary-color" : "bg-icon-color/15"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
        <section className="rounded-3xl bg-white p-5 shadow-[0_12px_24px_rgba(145,158,171,0.12)] sm:p-8">
          <p className="text-sm text-icon-color/60">
            {createSchoolDataLanguage.stepOf(lang, activeIndex + 1, steps.length)}
          </p>
          <h2 className="mt-1 text-xl font-bold text-icon-color">
            {steps[activeIndex]}
          </h2>

          {activeIndex < 2 && (
            <form noValidate onSubmit={handleSubmit} className="mt-6">
              {activeIndex === 0 && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-icon-color">
                      {createSchoolDataLanguage.logo(lang)}
                    </span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-hidden
                        onClick={() => logoInputRef.current?.click()}
                        className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-background-color text-3xl text-icon-color/40 transition-colors hover:border-primary-color hover:text-primary-color ${
                          visibleError("logo", 0)
                            ? "border-error-color"
                            : profile.logo
                              ? "border-transparent"
                              : "border-icon-color/20"
                        } ${uploading ? "animate-pulse" : ""}`}
                      >
                        {profile.logo ? (
                          <Image
                            src={profile.logo}
                            fill
                            sizes="96px"
                            placeholder="blur"
                            blurDataURL={decodeBlurhashToCanvas(
                              profile.blurHash || defaultBlurHash,
                            )}
                            className="object-cover"
                            alt=""
                          />
                        ) : (
                          <LuImagePlus />
                        )}
                      </button>
                      <div className="flex min-w-0 flex-col items-start gap-1.5">
                        <button
                          id="school-logo-button"
                          type="button"
                          disabled={uploading}
                          onClick={() => logoInputRef.current?.click()}
                          aria-describedby={
                            visibleError("logo", 0)
                              ? "school-logo-error"
                              : "school-logo-hint"
                          }
                          className="h-10 rounded-xl border border-icon-color/15 px-4 text-sm font-semibold text-icon-color transition-colors hover:bg-background-color focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/20 disabled:cursor-wait disabled:opacity-70"
                        >
                          {uploading
                            ? createSchoolDataLanguage.uploadingLogo(lang)
                            : profile.logo
                              ? createSchoolDataLanguage.replaceLogo(lang)
                              : createSchoolDataLanguage.uploadTitle(lang)}
                        </button>
                        {visibleError("logo", 0) ? (
                          <p
                            id="school-logo-error"
                            role="alert"
                            className="flex items-start gap-1.5 text-sm text-error-color"
                          >
                            <MdErrorOutline
                              aria-hidden
                              className="mt-0.5 shrink-0"
                            />
                            {visibleError("logo", 0)}
                          </p>
                        ) : (
                          <p
                            id="school-logo-hint"
                            className="text-sm text-icon-color/60"
                          >
                            {createSchoolDataLanguage.logoHint(lang)}
                          </p>
                        )}
                      </div>
                      <input
                        ref={logoInputRef}
                        accept="image/*"
                        onChange={handleUploadImage}
                        type="file"
                        className="hidden"
                      />
                    </div>
                  </div>

                  <FormField
                    id="school-school"
                    label={createSchoolDataLanguage.school(lang)}
                    error={visibleError("school", 0)}
                  >
                    <input
                      id="school-school"
                      type="text"
                      autoComplete="organization"
                      placeholder={createSchoolDataLanguage.schoolPlaceholder(
                        lang,
                      )}
                      value={profile.school}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          school: e.target.value,
                        }))
                      }
                      onBlur={touch("school")}
                      aria-invalid={!!visibleError("school", 0)}
                      aria-describedby={describedBy(
                        "school-school",
                        visibleError("school", 0),
                      )}
                      className={fieldInputClass(!!visibleError("school", 0))}
                    />
                  </FormField>

                  <FormField
                    id="school-description"
                    label={createSchoolDataLanguage.description(lang)}
                    error={visibleError("description", 0)}
                  >
                    <textarea
                      id="school-description"
                      rows={3}
                      placeholder={createSchoolDataLanguage.descriptionPlaceholder(
                        lang,
                      )}
                      value={profile.description}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      onBlur={touch("description")}
                      aria-invalid={!!visibleError("description", 0)}
                      aria-describedby={describedBy(
                        "school-description",
                        visibleError("description", 0),
                      )}
                      className={`${fieldInputClass(
                        !!visibleError("description", 0),
                      )} h-auto resize-y py-3 leading-relaxed`}
                    />
                  </FormField>
                </div>
              )}

              {activeIndex === 1 && (
                <div className="flex flex-col gap-5">
                  <FormField
                    id="school-country"
                    label={createSchoolDataLanguage.country(lang)}
                    error={visibleError("country", 1)}
                  >
                    <select
                      id="school-country"
                      autoComplete="country-name"
                      value={address.country}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      onBlur={touch("country")}
                      aria-invalid={!!visibleError("country", 1)}
                      className={`${fieldInputClass(
                        !!visibleError("country", 1),
                      )} cursor-pointer`}
                    >
                      <option value="" disabled>
                        {createSchoolDataLanguage.countryPlaceholder(lang)}
                      </option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    id="school-address"
                    label={createSchoolDataLanguage.streetAddress(lang)}
                    error={visibleError("address", 1)}
                  >
                    <input
                      id="school-address"
                      type="text"
                      autoComplete="street-address"
                      placeholder={createSchoolDataLanguage.streetAddressPlaceholder(
                        lang,
                      )}
                      value={address.address}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      onBlur={touch("address")}
                      aria-invalid={!!visibleError("address", 1)}
                      aria-describedby={describedBy(
                        "school-address",
                        visibleError("address", 1),
                      )}
                      className={fieldInputClass(!!visibleError("address", 1))}
                    />
                  </FormField>

                  <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_11rem] sm:gap-4">
                    <FormField
                      id="school-city"
                      label={createSchoolDataLanguage.city(lang)}
                      error={visibleError("city", 1)}
                    >
                      <input
                        id="school-city"
                        type="text"
                        autoComplete="address-level1"
                        value={address.city}
                        onChange={(e) =>
                          setAddress((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        onBlur={touch("city")}
                        aria-invalid={!!visibleError("city", 1)}
                        aria-describedby={describedBy(
                          "school-city",
                          visibleError("city", 1),
                        )}
                        className={fieldInputClass(!!visibleError("city", 1))}
                      />
                    </FormField>
                    <FormField
                      id="school-zipCode"
                      label={createSchoolDataLanguage.zipCode(lang)}
                      error={visibleError("zipCode", 1)}
                    >
                      <input
                        id="school-zipCode"
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        value={address.zipCode}
                        onChange={(e) =>
                          setAddress((prev) => ({
                            ...prev,
                            zipCode: e.target.value,
                          }))
                        }
                        onBlur={touch("zipCode")}
                        aria-invalid={!!visibleError("zipCode", 1)}
                        aria-describedby={describedBy(
                          "school-zipCode",
                          visibleError("zipCode", 1),
                        )}
                        className={fieldInputClass(!!visibleError("zipCode", 1))}
                      />
                    </FormField>
                  </div>

                  <FormField
                    id="school-phoneNumber"
                    label={createSchoolDataLanguage.phone(lang)}
                    error={visibleError("phoneNumber", 1)}
                  >
                    <PhoneInput
                      defaultCountry="th"
                      value={address.phoneNumber}
                      onChange={(phone) =>
                        setAddress((prev) => ({ ...prev, phoneNumber: phone }))
                      }
                      className="w-full"
                      inputClassName="!h-12 flex-1 !text-base !text-icon-color"
                      inputProps={{
                        id: "school-phoneNumber",
                        autoComplete: "tel",
                        onBlur: touch("phoneNumber"),
                        "aria-invalid": !!visibleError("phoneNumber", 1),
                        "aria-describedby": describedBy(
                          "school-phoneNumber",
                          visibleError("phoneNumber", 1),
                        ),
                      }}
                      style={
                        {
                          "--react-international-phone-height": "3rem",
                          "--react-international-phone-border-radius":
                            "0.75rem",
                          "--react-international-phone-border-color":
                            visibleError("phoneNumber", 1)
                              ? "#F04438"
                              : "rgba(56, 55, 103, 0.15)",
                          "--react-international-phone-font-size": "1rem",
                        } as React.CSSProperties
                      }
                    />
                  </FormField>
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-icon-color/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                {activeIndex === 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveIndex(0)}
                    className="h-12 rounded-xl px-5 font-semibold text-icon-color transition-colors hover:bg-background-color focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/20"
                  >
                    {createSchoolDataLanguage.back(lang)}
                  </button>
                ) : (
                  <span aria-hidden className="hidden sm:block" />
                )}
                <button
                  type="submit"
                  disabled={uploading || createSchool.isPending}
                  aria-busy={createSchool.isPending}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-color px-6 font-semibold text-white transition-colors hover:bg-primary-color-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/30 active:bg-primary-color-focus disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-44"
                >
                  {createSchool.isPending && (
                    <span
                      aria-hidden
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                    />
                  )}
                  {activeIndex === 0
                    ? createSchoolDataLanguage.button(lang)
                    : createSchool.isPending
                      ? createSchoolDataLanguage.creating(lang)
                      : createSchoolDataLanguage.create(lang)}
                </button>
              </div>
            </form>
          )}

          {activeIndex === 2 && createSchool.data && (
            <div className="mt-6">
              <div
                role="status"
                className="mb-6 flex gap-3 rounded-2xl bg-success-color/10 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-color text-lg text-white">
                  <MdCheck aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-icon-color">
                    {createSchoolDataLanguage.created(lang)}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-icon-color/70">
                    {createSchoolDataLanguage.createdDetail(lang)}
                  </p>
                </div>
              </div>
              <InviteJoinSchool schoolId={createSchool.data.id} />
            </div>
          )}
        </section>

        <aside
          aria-label={createSchoolDataLanguage.preview(lang)}
          className="hidden lg:sticky lg:top-6 lg:block"
        >
          <p className="mb-3 text-sm font-medium text-icon-color/60">
            {createSchoolDataLanguage.preview(lang)}
          </p>
          <div className="overflow-hidden rounded-3xl bg-white shadow-[0_12px_24px_rgba(145,158,171,0.12)]">
            <div className="h-16 bg-gradient-to-r from-primary-color to-secondary-color" />
            <div className="px-5 pb-5">
              <div className="relative -mt-8 h-16 w-16 overflow-hidden rounded-2xl bg-white ring-4 ring-white">
                {profile.logo ? (
                  <Image
                    src={profile.logo}
                    fill
                    sizes="64px"
                    placeholder="blur"
                    blurDataURL={decodeBlurhashToCanvas(
                      profile.blurHash || defaultBlurHash,
                    )}
                    className="object-cover"
                    alt=""
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-background-color text-2xl text-icon-color/30">
                    <LuImagePlus aria-hidden />
                  </div>
                )}
              </div>
              <p
                className={`mt-3 break-words text-lg font-bold leading-snug ${
                  profile.school.trim()
                    ? "text-icon-color"
                    : "text-icon-color/30"
                }`}
              >
                {profile.school.trim() ||
                  createSchoolDataLanguage.previewName(lang)}
              </p>
              <p
                className={`mt-1 line-clamp-3 break-words text-sm leading-relaxed ${
                  profile.description.trim()
                    ? "text-icon-color/70"
                    : "text-icon-color/30"
                }`}
              >
                {profile.description.trim() ||
                  createSchoolDataLanguage.previewDescription(lang)}
              </p>
              {(address.city.trim() || hasPhone) && (
                <ul className="mt-4 flex flex-col gap-2 border-t border-icon-color/10 pt-4 text-sm text-icon-color/70">
                  {address.city.trim() && (
                    <li className="flex items-center gap-2">
                      <LuMapPin aria-hidden className="shrink-0" />
                      <span className="truncate">{location}</span>
                    </li>
                  )}
                  {hasPhone && (
                    <li className="flex items-center gap-2">
                      <LuPhone aria-hidden className="shrink-0" />
                      <span className="truncate">{address.phoneNumber}</span>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateSchoolComponent;
