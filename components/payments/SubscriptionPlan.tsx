import { useState } from "react";
import { School } from "../../interfaces";
import { useGetLanguage, useGetListSubscription } from "../../react-query";
import LoadingBar from "../common/LoadingBar";
import InputNumber from "../common/InputNumber";
import { SubscriptionDataLanguage } from "../../data/languages/subscription";
import { FiCheck, FiX } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

type PlanKey = "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE";
type FeatureValue = boolean | { en: string; th: string };
type FeatureKey =
  | "basic"
  | "users"
  | "storage"
  | "support"
  | "classrooms"
  | "subjects"
  | "lineBot";

type PricingPlan = {
  key: PlanKey;
  title: string;
  title_th: string;
  /** Stripe product title; null for the free plan. */
  product: string | null;
  popular: boolean;
  /** Baht. monthValue 0 on a paid plan means annual billing only. */
  price: { monthValue: number; yearValue: number; permember: boolean };
  infoNote: string;
  infoNote_th: string;
  /** Monthly AI quiz generations per school; mirrors QUIZ_GEN_LIMITS on the server. */
  aiQuiz: number;
  features: Record<FeatureKey, FeatureValue>;
};

const featureLabels: { key: FeatureKey; en: string; th: string }[] = [
  { key: "basic", en: "Basic Feature", th: "ฟีเจอร์พื้นฐาน" },
  { key: "users", en: "Members in a school", th: "สมาชิกในโรงเรียน" },
  { key: "storage", en: "Total Storage Size", th: "ขนาดพื้นที่จัดเก็บข้อมูล" },
  { key: "support", en: "Direct Chat Support", th: "แชทกับผู้พัฒนา" },
  { key: "classrooms", en: "Classroom Limit", th: "จำกัดห้องเรียน" },
  { key: "subjects", en: "Subject Limit", th: "จำกัดวิชา" },
  { key: "lineBot", en: "LINE Chat Bot", th: "แชทบอทใน LINE" },
];

const unlimited = { en: "Unlimited", th: "ไม่จำกัด" };

const pricingData: PricingPlan[] = [
  {
    key: "FREE",
    title: "FREE",
    title_th: "ฟรี",
    product: null,
    popular: false,
    price: { monthValue: 0, yearValue: 0, permember: false },
    infoNote: "Free plan is good for 1 teacher in a school.",
    infoNote_th: "แผนฟรีเหมาะสำหรับครู 1 คนในโรงเรียน",
    aiQuiz: 5,
    features: {
      basic: true,
      users: { en: "2", th: "2" },
      storage: { en: "15GB", th: "15GB" },
      support: true,
      classrooms: { en: "3 classrooms", th: "3 ห้องเรียน" },
      subjects: { en: "3 subjects", th: "3 วิชา" },
      lineBot: false,
    },
  },
  {
    key: "BASIC",
    title: "BASIC",
    title_th: "พื้นฐาน",
    product: "Tatuga School Basic",
    popular: false,
    price: { monthValue: 0, yearValue: 590, permember: false },
    infoNote: "Basic plan is good for 1 - 2 teachers in a school",
    infoNote_th: "แผนพื้นฐานเหมาะสำหรับครู 1 - 2 คนในโรงเรียน",
    aiQuiz: 100,
    features: {
      basic: true,
      users: { en: "2", th: "2" },
      storage: unlimited,
      support: true,
      classrooms: { en: "10 classrooms", th: "10 ห้องเรียน" },
      subjects: { en: "10 subjects", th: "10 วิชา" },
      lineBot: false,
    },
  },
  {
    key: "PREMIUM",
    title: "PREMIUM",
    title_th: "พรีเมียม",
    product: "Tatuga School Premium",
    popular: true,
    price: { monthValue: 290, yearValue: 1490, permember: false },
    infoNote: "Premium plan is good for 1 - 3 teachers in a school",
    infoNote_th: "แผนพรีเมียมเหมาะสำหรับครู 1 - 3 คนในโรงเรียน",
    aiQuiz: 300,
    features: {
      basic: true,
      users: { en: "3", th: "3" },
      storage: unlimited,
      support: true,
      classrooms: { en: "20 classrooms", th: "20 ห้องเรียน" },
      subjects: { en: "30 subjects", th: "30 วิชา" },
      lineBot: true,
    },
  },
  {
    key: "ENTERPRISE",
    title: "ENTERPRISE",
    title_th: "องค์กร",
    product: "Tatuga School Enterprise",
    popular: false,
    price: { monthValue: 150, yearValue: 1100, permember: true },
    infoNote:
      "Enterprise plan is good for a school that has more than 5 teachers",
    infoNote_th: "แผนองค์กรเหมาะสำหรับโรงเรียนที่มีครูมากกว่า 4 คน",
    aiQuiz: 2000,
    features: {
      basic: true,
      users: { en: "custom", th: "กำหนดเอง" },
      storage: unlimited,
      support: true,
      classrooms: unlimited,
      subjects: unlimited,
      lineBot: true,
    },
  },
];

type Props = {
  school: School;
  onSelectPlan: (
    priceId: string,
    product: { price: string; title: string; time: string },
    members: number,
    isUpgrade: boolean,
  ) => void;
};

const planRank: Record<string, number> = {
  FREE: 0,
  BASIC: 1,
  PREMIUM: 2,
  ENTERPRISE: 3,
};

const baht = (value: number) => `${value.toLocaleString()}฿`;

const calculateMaxSavings = () => {
  let maxSavings = 0;
  pricingData.forEach(({ price }) => {
    if (price.monthValue > 0 && price.yearValue) {
      const monthlyTotal = price.monthValue * 12;
      const savings = ((monthlyTotal - price.yearValue) / monthlyTotal) * 100;
      if (savings > maxSavings) {
        maxSavings = savings;
      }
    }
  });
  return Math.round(maxSavings);
};

const SubscriptionPlan = ({ school, onSelectPlan }: Props) => {
  const subscriptions = useGetListSubscription();
  const [monthprice, setMonthPrice] = useState(false);
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [members, setMembers] = useState(
    school.limitSchoolMember < 4 ? 4 : school.limitSchoolMember,
  );
  if (subscriptions.isLoading || !subscriptions.data) {
    return (
      <div className="mt-5">
        <LoadingBar />
      </div>
    );
  }

  const findPriceId = (product: string | null) =>
    subscriptions.data.find(
      (s) => s.title === product && s.time === (monthprice ? "month" : "year"),
    )?.priceId;

  return (
    <div className="w-full font-Anuphan">
      <div className="flex flex-col items-center pb-8 pt-10 text-center">
        <span className="text-sm font-semibold text-primary-color">
          {SubscriptionDataLanguage.pricing(lang)}
        </span>
        <h2 className="mt-2 text-2xl font-bold text-icon-color sm:text-3xl">
          {SubscriptionDataLanguage.title(lang)}
        </h2>
        <p className="mt-2 text-icon-color/70">
          {SubscriptionDataLanguage.description(lang)}
        </p>
        <div
          role="radiogroup"
          className="mt-6 inline-flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-icon-color/10"
        >
          <button
            type="button"
            role="radio"
            aria-checked={monthprice}
            onClick={() => setMonthPrice(true)}
            className={`h-10 rounded-full px-5 text-sm font-semibold transition-colors ${
              monthprice
                ? "bg-primary-color text-white"
                : "text-icon-color/70 hover:text-icon-color"
            }`}
          >
            {SubscriptionDataLanguage.monthly(lang)}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!monthprice}
            onClick={() => setMonthPrice(false)}
            className={`flex h-10 items-center gap-2 rounded-full pl-5 pr-2 text-sm font-semibold transition-colors ${
              !monthprice
                ? "bg-primary-color text-white"
                : "text-icon-color/70 hover:text-icon-color"
            }`}
          >
            {SubscriptionDataLanguage.annual(lang)}
            <span
              className={`hidden rounded-full px-2 py-0.5 text-xs sm:inline ${
                !monthprice
                  ? "bg-white/20 text-white"
                  : "bg-success-color/10 text-success-color"
              }`}
            >
              {SubscriptionDataLanguage.save_up_to(lang, calculateMaxSavings())}
            </span>
          </button>
        </div>
        <span className="mt-3 rounded-full bg-success-color/10 px-3 py-1 text-xs font-semibold text-success-color sm:hidden">
          {SubscriptionDataLanguage.save_up_to(lang, calculateMaxSavings())}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {pricingData.map((plan) => {
          const { price } = plan;
          const isCurrent = school.plan === plan.key;
          const isUpgrade =
            !!school.stripe_subscription_id &&
            (planRank[plan.key] ?? 0) > (planRank[school.plan] ?? 0);
          const seats = price.permember ? members : 1;
          const isFree = price.monthValue === 0 && price.yearValue === 0;
          const monthlyUnavailable =
            monthprice && price.monthValue === 0 && !isFree;
          const amount =
            (monthprice ? price.monthValue : price.yearValue) * seats;
          const priceText = isFree
            ? lang === "en"
              ? "Free"
              : "ฟรี"
            : monthlyUnavailable
              ? "—"
              : baht(amount);
          const period = isFree
            ? lang === "en"
              ? "Free forever"
              : "ใช้ฟรีตลอดไป"
            : monthlyUnavailable
              ? SubscriptionDataLanguage.annual_only(lang)
              : price.permember
                ? lang === "en"
                  ? `for ${members} teachers / ${monthprice ? "month" : "year"}`
                  : `สำหรับคุณครู ${members} ท่าน / ${monthprice ? "เดือน" : "ปี"}`
                : lang === "en"
                  ? `per ${monthprice ? "month" : "year"}`
                  : `ต่อ${monthprice ? "เดือน" : "ปี"}`;

          const selectPlan = () => {
            const priceId = findPriceId(plan.product);
            if (!priceId) return;
            onSelectPlan(
              priceId,
              {
                time: monthprice ? "month" : "year",
                title: plan.product as string,
                price: price.permember
                  ? amount.toString()
                  : baht(monthprice ? price.monthValue : price.yearValue),
              },
              seats,
              isUpgrade,
            );
          };

          return (
            <div
              key={plan.key}
              className={`flex flex-col rounded-3xl bg-white p-6 ${
                plan.popular
                  ? "shadow-[0_24px_48px_-28px_rgba(44,124,209,0.6)] ring-2 ring-primary-color"
                  : "ring-1 ring-icon-color/10"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-icon-color">
                  {lang === "en" ? plan.title : plan.title_th}
                </h3>
                {plan.popular && (
                  <span className="rounded-full bg-primary-color px-3 py-1 text-xs font-semibold text-white">
                    {SubscriptionDataLanguage.popular(lang)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-snug text-icon-color/60 md:min-h-14">
                {lang === "en" ? plan.infoNote : plan.infoNote_th}
              </p>

              <div className="mt-5 flex flex-wrap items-baseline gap-x-2">
                <span className="text-4xl font-bold tabular-nums text-icon-color">
                  {priceText}
                </span>
                {!monthprice && price.monthValue > 0 && (
                  <span className="text-lg tabular-nums text-icon-color/40 line-through">
                    {baht(price.monthValue * seats * 12)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-icon-color/60">{period}</p>
              <div className="mt-2 h-6">
                {!monthprice && price.yearValue > 0 && (
                  <span className="inline-flex rounded-full bg-success-color/10 px-2.5 py-0.5 text-xs font-semibold text-success-color">
                    {SubscriptionDataLanguage.only(lang)}{" "}
                    {Math.round(
                      (price.yearValue * seats) / 12,
                    ).toLocaleString()}
                    ฿{SubscriptionDataLanguage.month_unit(lang)}
                  </span>
                )}
              </div>

              <div className="mt-4">
                {price.permember ? (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-icon-color/70">
                      {SubscriptionDataLanguage.members_label(lang)}
                    </label>
                    <InputNumber
                      placeholder="Enter number of members"
                      min={4}
                      max={500}
                      value={members}
                      onValueChange={() => {}}
                      onChange={(value) => {
                        if (value > 3 && value <= 500) {
                          setMembers(value);
                        } else if (value < 4) {
                          setMembers(4);
                        } else if (value > 500) {
                          setMembers(500);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={selectPlan}
                      className={`h-12 w-full rounded-full font-semibold transition-colors ${
                        isCurrent
                          ? "bg-white text-icon-color ring-1 ring-icon-color/20 hover:ring-icon-color/40"
                          : "bg-primary-color text-white hover:bg-primary-color-hover active:bg-primary-color-focus"
                      }`}
                    >
                      {isCurrent
                        ? SubscriptionDataLanguage.update_members(lang)
                        : isUpgrade
                          ? SubscriptionDataLanguage.upgrade(lang)
                          : SubscriptionDataLanguage.get_started(lang)}
                    </button>
                  </div>
                ) : monthlyUnavailable ? (
                  <div className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-background-color text-sm font-semibold text-icon-color/40">
                    {SubscriptionDataLanguage.not_available(lang)}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={selectPlan}
                    disabled={isCurrent}
                    className={`h-12 w-full rounded-full font-semibold transition-colors ${
                      isCurrent
                        ? "cursor-not-allowed bg-background-color text-icon-color/50"
                        : plan.popular
                          ? "bg-primary-color text-white hover:bg-primary-color-hover active:bg-primary-color-focus"
                          : "bg-white text-icon-color ring-1 ring-icon-color/20 hover:ring-icon-color/40"
                    }`}
                  >
                    {isCurrent
                      ? SubscriptionDataLanguage.current_plan(lang)
                      : isUpgrade
                        ? SubscriptionDataLanguage.upgrade(lang)
                        : SubscriptionDataLanguage.get_started(lang)}
                  </button>
                )}
              </div>

              <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-primary-color/5 px-3.5 py-3 ring-1 ring-primary-color/15">
                <HiSparkles className="h-5 w-5 shrink-0 text-primary-color" />
                <span className="text-sm font-semibold text-icon-color">
                  {SubscriptionDataLanguage.ai_quiz_per_month(
                    lang,
                    plan.aiQuiz,
                  )}
                </span>
              </div>

              <ul className="mt-5 space-y-3 border-t border-icon-color/10 pt-5">
                {featureLabels.map((feature) => {
                  const value = plan.features[feature.key];
                  return (
                    <li key={feature.key} className="flex items-start gap-2.5">
                      {value === false ? (
                        <FiX className="mt-0.5 h-4 w-4 shrink-0 text-icon-color/30" />
                      ) : (
                        <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-color" />
                      )}
                      <span
                        className={`text-sm ${
                          value === false
                            ? "text-icon-color/40"
                            : "text-icon-color/80"
                        }`}
                      >
                        <span className="font-medium">
                          {lang === "en" ? feature.en : feature.th}:
                        </span>{" "}
                        {value === true
                          ? SubscriptionDataLanguage.available(lang)
                          : value === false
                            ? SubscriptionDataLanguage.not_available(lang)
                            : value[lang]}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default SubscriptionPlan;
