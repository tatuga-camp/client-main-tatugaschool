import React, { useRef, useState } from "react";
import Link from "next/link";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { SignUpService } from "@/services";
import Swal from "sweetalert2";
import UserAgreement from "../agreements/UserAgreement";
import { ErrorMessages } from "../../interfaces";
import { useRouter } from "next-nprogress-bar";
import Password from "../common/Password";
import { FcGoogle } from "react-icons/fc";
import { MdCheck, MdClose, MdErrorOutline } from "react-icons/md";
import { PhoneInput } from "react-international-phone";
import { requestData, signUpLanguageData } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { setAccessToken, setRefreshToken } from "../../utils";
import { describedBy, fieldInputClass, FormField } from "../common/FormField";

// The policy lives on the marketing site so there is one copy for every app.
const PRIVACY_POLICY_URL = "https://tatugaschool.com/support/privacy-policy";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

type Props = {
  email?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  providerId?: string | undefined;
  photo?: string | undefined;
  provider?: "google" | undefined;
  invitation?: {
    email: string;
    schoolTitle: string;
    schoolLogo: string;
    invitationToken: string;
  } | null;
  invitationError?: string | null;
};

type FieldName =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword";

const FIELD_ORDER: FieldName[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "password",
  "confirmPassword",
];

export const SignUpForm = (props: Props) => {
  const router = useRouter();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const isGoogle = props.provider === "google";

  const [isAgree, setIsAgree] = useState(false);
  const [firstName, setFirstName] = useState(props.firstName ?? "");
  const [lastName, setLastName] = useState(props.lastName ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(props.invitation?.email ?? props.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Errors stay hidden until a field is left or the form is submitted, so
  // nobody gets told off while still typing.
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);
  const termsDialogRef = useRef<HTMLDialogElement>(null);

  // Cloudflare Turnstile bot check. Required for every provider, including
  // Google, because the server can't tell a real Google sign-up from a forged
  // POST. Tokens are single-use, so the widget is reset after a failed submit.
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const errors: Record<FieldName, string | null> = {
    firstName: firstName.trim() ? null : signUpLanguageData.required(lang),
    lastName: lastName.trim() ? null : signUpLanguageData.required(lang),
    email: !email.trim()
      ? signUpLanguageData.required(lang)
      : EMAIL_REGEX.test(email.trim())
        ? null
        : signUpLanguageData.invalidEmail(lang),
    // The phone value always carries the dial code (e.g. "+66"), so count
    // digits rather than checking for an empty string.
    phone:
      phone.replace(/\D/g, "").length >= 8
        ? null
        : signUpLanguageData.invalidPhone(lang),
    password: isGoogle
      ? null
      : !password
        ? signUpLanguageData.required(lang)
        : passwordLongEnough
          ? null
          : signUpLanguageData.passwordTooShort(lang),
    confirmPassword: isGoogle
      ? null
      : !confirmPassword
        ? signUpLanguageData.required(lang)
        : passwordsMatch
          ? null
          : signUpLanguageData.passwordMismatch(lang),
  };
  const visibleError = (field: FieldName) =>
    submitted || touched[field] ? errors[field] : null;
  const touch = (field: FieldName) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitted(true);

    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalid) {
      document.getElementById(`signup-${firstInvalid}`)?.focus();
      return;
    }
    if (!isAgree) {
      document.getElementById("signup-agree")?.focus();
      return;
    }
    if (!turnstileToken) return;

    try {
      setSubmitting(true);
      const response = await SignUpService({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
        photo: props.photo,
        providerId: props.providerId,
        provider: isGoogle ? "GOOGLE" : "LOCAL",
        invitationToken: props.invitation?.invitationToken,
        language: lang,
        turnstileToken,
      });

      // Same as sign-in: the server cookie only lands on the API host, so store
      // our own copy before the next page fires authenticated requests.
      setAccessToken({ access_token: response.accessToken });
      setRefreshToken({ refresh_token: response.refreshToken });
      router.push(response.redirectUrl);

      await Swal.fire({
        title: requestData.successTitle(lang),
        text: requestData.successSignUp(lang),
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      setSubmitting(false);
      setTurnstileToken(null);
      turnstileRef.current?.reset();
      let result = error as ErrorMessages;
      Swal.fire({
        title: result?.error ? result?.error : "Something Went Wrong",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Code Error: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };

  const handleGoogleSignUp = () => {
    Swal.fire({
      title: requestData.loadingTitle(lang),
      text: requestData.loadingDescription(lang),
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    router.push(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/auth/google`);
  };

  const showAgreeError = submitted && !isAgree;
  const showTurnstileError =
    submitted && isAgree && !turnstileToken && !submitting;

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-[0_12px_24px_rgba(145,158,171,0.12)] sm:p-8 lg:max-w-lg lg:p-10">
      <h2 className="text-2xl font-bold leading-snug text-icon-color xl:text-[28px]">
        {signUpLanguageData.title(lang)}
      </h2>
      <p className="mt-1.5 text-sm text-icon-color/70">
        {signUpLanguageData.haveAccount(lang)}{" "}
        <Link
          href="/auth/sign-in"
          className="font-semibold text-primary-color underline-offset-4 hover:underline"
        >
          {signUpLanguageData.signIn(lang)}
        </Link>
      </p>

      {props.invitation && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-primary-color/[0.07] p-4">
          {props.invitation.schoolLogo && (
            <img
              src={props.invitation.schoolLogo}
              alt=""
              className="h-11 w-11 shrink-0 rounded-xl bg-white object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm text-icon-color/70">
              {signUpLanguageData.invitedTo(lang)}
            </p>
            <p className="truncate font-semibold text-icon-color">
              {props.invitation.schoolTitle}
            </p>
          </div>
        </div>
      )}
      {props.invitationError && (
        <div
          role="status"
          className="mt-6 flex gap-2.5 rounded-2xl bg-warning-color/15 p-4 text-sm leading-relaxed text-icon-color"
        >
          <MdErrorOutline aria-hidden className="mt-0.5 shrink-0 text-lg" />
          <p>
            <span className="font-semibold">{props.invitationError}.</span>{" "}
            {signUpLanguageData.invitationError(lang)}
          </p>
        </div>
      )}

      {isGoogle ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-icon-color/10 p-3">
          {props.photo ? (
            <img
              src={props.photo}
              alt=""
              referrerPolicy="no-referrer"
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <FcGoogle aria-hidden className="h-10 w-10 shrink-0 p-2" />
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm text-icon-color/70">
              {props.photo && <FcGoogle aria-hidden />}
              {signUpLanguageData.googleConnected(lang)}
            </p>
            <p className="truncate font-medium text-icon-color">{email}</p>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-icon-color/15 bg-white font-semibold text-icon-color transition-colors hover:bg-background-color focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/20"
          >
            <FcGoogle aria-hidden className="text-xl" />
            {signUpLanguageData.createAccountGoogle(lang)}
          </button>
          <div className="my-6 flex items-center gap-3 text-sm text-icon-color/50">
            <span aria-hidden className="h-px flex-1 bg-icon-color/10" />
            {signUpLanguageData.orEmail(lang)}
            <span aria-hidden className="h-px flex-1 bg-icon-color/10" />
          </div>
        </>
      )}

      <form
        noValidate
        onSubmit={handleSignUp}
        className={`flex flex-col gap-5 ${isGoogle ? "mt-6" : ""}`}
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <FormField
            id="signup-firstName"
            label={signUpLanguageData.firstNameTitle(lang)}
            error={visibleError("firstName")}
          >
            <input
              id="signup-firstName"
              type="text"
              autoComplete="given-name"
              disabled={isGoogle && !!props.firstName}
              placeholder={signUpLanguageData.firstNamePlaceholder(lang)}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={touch("firstName")}
              aria-invalid={!!visibleError("firstName")}
              aria-describedby={describedBy(
                "signup-firstName",
                visibleError("firstName"),
              )}
              className={fieldInputClass(!!visibleError("firstName"))}
            />
          </FormField>
          <FormField
            id="signup-lastName"
            label={signUpLanguageData.lastNameTitle(lang)}
            error={visibleError("lastName")}
          >
            <input
              id="signup-lastName"
              type="text"
              autoComplete="family-name"
              disabled={isGoogle && !!props.lastName}
              placeholder={signUpLanguageData.lastNamePlaceholder(lang)}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={touch("lastName")}
              aria-invalid={!!visibleError("lastName")}
              aria-describedby={describedBy(
                "signup-lastName",
                visibleError("lastName"),
              )}
              className={fieldInputClass(!!visibleError("lastName"))}
            />
          </FormField>
        </div>

        {!isGoogle && (
          <FormField
            id="signup-email"
            label={signUpLanguageData.email(lang)}
            hint={
              props.invitation ? undefined : signUpLanguageData.emailHint(lang)
            }
            error={visibleError("email")}
          >
            <input
              id="signup-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              disabled={!!props.invitation}
              placeholder={signUpLanguageData.emailPlaceholder(lang)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={touch("email")}
              aria-invalid={!!visibleError("email")}
              aria-describedby={describedBy(
                "signup-email",
                visibleError("email"),
                props.invitation
                  ? undefined
                  : signUpLanguageData.emailHint(lang),
              )}
              className={fieldInputClass(!!visibleError("email"))}
            />
          </FormField>
        )}

        <FormField
          id="signup-phone"
          label={signUpLanguageData.phone(lang)}
          error={visibleError("phone")}
        >
          <PhoneInput
            defaultCountry="th"
            value={phone}
            onChange={(value) => setPhone(value)}
            className="w-full"
            inputClassName="!h-12 flex-1 !text-base !text-icon-color"
            inputProps={{
              id: "signup-phone",
              autoComplete: "tel",
              onBlur: touch("phone"),
              "aria-invalid": !!visibleError("phone"),
              "aria-describedby": describedBy(
                "signup-phone",
                visibleError("phone"),
              ),
            }}
            style={
              {
                "--react-international-phone-height": "3rem",
                "--react-international-phone-border-radius": "0.75rem",
                "--react-international-phone-border-color": visibleError(
                  "phone",
                )
                  ? "#F04438"
                  : "rgba(56, 55, 103, 0.15)",
                "--react-international-phone-font-size": "1rem",
              } as React.CSSProperties
            }
          />
        </FormField>

        {!isGoogle && (
          <>
            <FormField
              id="signup-password"
              label={signUpLanguageData.password(lang)}
              error={
                // The checklist below already explains length while typing;
                // only repeat it as an error once it actually blocks submit.
                visibleError("password") === signUpLanguageData.required(lang)
                  ? visibleError("password")
                  : null
              }
            >
              <div onBlur={touch("password")}>
                <Password
                  inputId="signup-password"
                  autoComplete="new-password"
                  placeholder={signUpLanguageData.passwordPlaceholder(lang)}
                  value={password}
                  feedback={false}
                  toggleMask
                  onChange={(e) => setPassword(e.target.value)}
                  invalid={!!visibleError("password")}
                  ariaDescribedBy="signup-password-rules"
                  inputClassName={`${fieldInputClass(
                    !!visibleError("password"),
                  )} pr-12`}
                />
              </div>
            </FormField>
            <FormField
              id="signup-confirmPassword"
              label={signUpLanguageData.confirmPassword(lang)}
              error={
                visibleError("confirmPassword") ===
                signUpLanguageData.required(lang)
                  ? visibleError("confirmPassword")
                  : null
              }
            >
              <div onBlur={touch("confirmPassword")}>
                <Password
                  inputId="signup-confirmPassword"
                  autoComplete="new-password"
                  placeholder={signUpLanguageData.confirmPasswordPlaceholder(
                    lang,
                  )}
                  value={confirmPassword}
                  feedback={false}
                  toggleMask
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  invalid={!!visibleError("confirmPassword")}
                  ariaDescribedBy="signup-password-rules"
                  inputClassName={`${fieldInputClass(
                    !!visibleError("confirmPassword"),
                  )} pr-12`}
                />
              </div>
            </FormField>
            <ul
              id="signup-password-rules"
              aria-live="polite"
              className="-mt-2 flex flex-col gap-1.5 text-sm"
            >
              {[
                {
                  met: passwordLongEnough,
                  label: signUpLanguageData.ruleLength(lang),
                  failed: !!visibleError("password"),
                },
                {
                  met: passwordsMatch,
                  label: signUpLanguageData.ruleMatch(lang),
                  failed: !!visibleError("confirmPassword"),
                },
              ].map((rule) => (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 ${
                    rule.met
                      ? "text-success-color"
                      : rule.failed
                        ? "text-error-color"
                        : "text-icon-color/60"
                  }`}
                >
                  {rule.met ? (
                    <MdCheck aria-hidden className="shrink-0 text-base" />
                  ) : (
                    <MdClose aria-hidden className="shrink-0 text-base" />
                  )}
                  {rule.label}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-icon-color/80">
            <input
              id="signup-agree"
              type="checkbox"
              checked={isAgree}
              onChange={(e) => setIsAgree(e.target.checked)}
              aria-invalid={showAgreeError}
              aria-describedby={showAgreeError ? "signup-agree-error" : undefined}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary-color"
            />
            <span>
              {signUpLanguageData.agreePrefix(lang)}{" "}
              <button
                type="button"
                onClick={(e) => {
                  // Inside the label, a click would also toggle the checkbox.
                  e.preventDefault();
                  termsDialogRef.current?.showModal();
                }}
                className="font-semibold text-primary-color underline underline-offset-4 hover:text-primary-color-hover"
              >
                {signUpLanguageData.termsOfService(lang)}
              </button>{" "}
              {signUpLanguageData.agreeJoin(lang)}{" "}
              <a
                href={PRIVACY_POLICY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-primary-color underline underline-offset-4 hover:text-primary-color-hover"
              >
                {signUpLanguageData.privacyPolicy(lang)}
              </a>
            </span>
          </label>
          {showAgreeError && (
            <p
              id="signup-agree-error"
              role="alert"
              className="flex items-start gap-1.5 pl-8 text-sm text-error-color"
            >
              <MdErrorOutline aria-hidden className="mt-0.5 shrink-0" />
              {signUpLanguageData.agreeRequired(lang)}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
            options={{
              action: "teacher-sign-up",
              theme: "light",
              language: lang,
              size: "flexible",
            }}
            className="w-full"
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />
          {showTurnstileError && (
            <p
              role="alert"
              className="flex items-start gap-1.5 self-start text-sm text-error-color"
            >
              <MdErrorOutline aria-hidden className="mt-0.5 shrink-0" />
              {signUpLanguageData.turnstileRequired(lang)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-color font-semibold text-white transition-colors hover:bg-primary-color-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/30 active:bg-primary-color-focus disabled:cursor-wait disabled:opacity-80"
        >
          {submitting && (
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
            />
          )}
          {submitting
            ? signUpLanguageData.creatingAccount(lang)
            : signUpLanguageData.createAccount(lang)}
        </button>
      </form>

      <dialog
        ref={termsDialogRef}
        aria-labelledby="terms-dialog-title"
        className="w-[min(44rem,calc(100vw-2rem))] rounded-3xl p-0 font-Anuphan text-icon-color shadow-xl backdrop:bg-icon-color/40"
        onClick={(e) => {
          // Clicking the backdrop (the dialog element itself) closes it.
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="flex max-h-[min(80dvh,48rem)] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-icon-color/10 px-6 py-4">
            <h2 id="terms-dialog-title" className="text-lg font-semibold">
              {signUpLanguageData.termsOfService(lang)}
            </h2>
            <button
              type="button"
              onClick={() => termsDialogRef.current?.close()}
              aria-label={signUpLanguageData.close(lang)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-icon-color/70 transition-colors hover:bg-background-color focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-color/20"
            >
              <MdClose aria-hidden />
            </button>
          </div>
          <div className="overflow-y-auto text-left text-sm leading-relaxed [&_h1]:hidden">
            <UserAgreement />
          </div>
          <div className="flex justify-end border-t border-icon-color/10 px-6 py-4">
            <button
              type="button"
              onClick={() => termsDialogRef.current?.close()}
              className="h-11 rounded-xl border border-icon-color/15 px-5 font-semibold transition-colors hover:bg-background-color"
            >
              {signUpLanguageData.close(lang)}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};
