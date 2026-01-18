import { useState } from "react";
import { School } from "../../interfaces";
import { useGetLanguage, useGetListSubscription } from "../../react-query";
import LoadingBar from "../common/LoadingBar";
import InputNumber from "../common/InputNumber";
import { SubscriptionDataLanguage } from "../../data/languages/subscription";
const pricingData = [
  {
    mainTitle: "",
    mainTitle_th: "",
    price: {
      month: null,
      year: null,
      permember: false,
    },
    popular: false,
    product: false,
    infoNote: "",
    infoNote_th: "",
    "Basic Feature": "Basic Feature",
    "Basic Feature_th": "ฟีเจอร์พื้นฐาน",
    Users: "Members in a school",
    Users_th: "สมาชิกในโรงเรียน",
    "Total Storage Size": "Total Storage Size",
    "Total Storage Size_th": "ขนาดพื้นที่จัดเก็บข้อมูล",
    Support: "Direct Chat Support",
    Support_th: "แชทกับผู้พัฒนา",
    Classroom_Limit: "Classroom Limit",
    Classroom_Limit_th: "จำกัดห้องเรียน",
    Subject_Limit: "Subject Limit",
    Subject_Limit_th: "จำกัดวิชา",
  },
  {
    mainTitle: "FREE",
    mainTitle_th: "ฟรี",
    popular: false,
    product: false,
    price: {
      month: "Free",
      month_th: "ฟรี",
      year: "Free",
      year_th: "ฟรี",
      monthValue: 0,
      yearValue: 0,
      permember: false,
    },
    infoNote: "Free plan is good for 1 teacher in a school.",
    infoNote_th: "แผนฟรีเหมาะสำหรับครู 1 คนในโรงเรียน",
    "Basic Feature": true,
    Users: 2,
    Users_th: 2,
    "Total Storage Size": "15GB",
    "Total Storage Size_th": "15GB",
    Support: true,
    Classroom_Limit: "3 classrooms",
    Classroom_Limit_th: "3 ห้องเรียน",
    Subject_Limit: "3 subjects",
    Subject_Limit_th: "3 วิชา",
  },
  {
    mainTitle: "BASIC",
    mainTitle_th: "พื้นฐาน",
    popular: false,
    product: "Tatuga School Basic",
    product_th: "โรงเรียนทาทูก้า พื้นฐาน",
    price: {
      month: "ไม่มี",
      month_th: "ไม่มี",
      year: "590฿",
      year_th: "590฿",
      monthValue: 0,
      yearValue: 590,
      permember: false,
    },
    infoNote: "Basic plan is good for 1 - 2 teachers in a school",
    infoNote_th: "แผนพื้นฐานเหมาะสำหรับครู 1 - 2 คนในโรงเรียน",
    "Basic Feature": true,
    Users: 2,
    Users_th: 2,
    "Total Storage Size": "15GB",
    "Total Storage Size_th": "15GB",
    Support: true,
    Classroom_Limit: "10 classrooms",
    Classroom_Limit_th: "10 ห้องเรียน",
    Subject_Limit: "10 subjects",
    Subject_Limit_th: "10 วิชา",
  },
  {
    mainTitle: "PREMIUM",
    mainTitle_th: "พรีเมียม",
    product: "Tatuga School Premium",
    product_th: "โรงเรียนทาทูก้า พรีเมียม",
    popular: true,
    price: {
      month: "290฿",
      month_th: "290฿",
      monthValue: 290,
      year: "1,490฿",
      year_th: "1,490฿",
      yearValue: 1490,
      permember: false,
    },
    infoNote: "Premium plan is good for 1 - 3 teachers in a school",
    infoNote_th: "แผนพรีเมียมเหมาะสำหรับครู 1 - 3 คนในโรงเรียน",
    "Basic Feature": true,
    Users: 3,
    Users_th: 3,

    "Total Storage Size": "100GB",
    "Total Storage Size_th": "100GB",
    Support: true,
    Classroom_Limit: "20 classrooms",
    Classroom_Limit_th: "20 ห้องเรียน",
    Subject_Limit: "30 subjects",
    Subject_Limit_th: "30 วิชา",
  },
  {
    popular: false,
    mainTitle: "ENTERPRISE",
    mainTitle_th: "องค์กร",
    product: "Tatuga School Enterprise",
    product_th: "โรงเรียนทาทูก้า องค์กร",
    price: {
      month: "150฿",
      month_th: "150฿",
      monthValue: 150,
      year: "1,100฿",
      year_th: "1,100฿",
      yearValue: 1100,
      permember: true,
    },
    infoNote:
      "Enterprise plan is good for a school that has more than 5 teachers",
    infoNote_th: "แผนองค์กรเหมาะสำหรับโรงเรียนที่มีครูมากกว่า 5 คน",
    "Basic Feature": true,
    Users: "custom",
    Users_th: "กำหนดเอง",
    "Total Storage Size": "9.77 TB",
    "Total Storage Size_th": "9.77 TB",
    Support: true,
    Classroom_Limit: "Unlimited",
    Classroom_Limit_th: "ไม่จำกัด",
    Subject_Limit: "Unlimited",
    Subject_Limit_th: "ไม่จำกัด",
  },
] as const;

const RightIcon = ({ className }: { className: string }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 13L9 17L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

type Props = {
  school: School;
  onSelectPlan: (
    priceId: string,
    product: { price: string; title: string; time: string },
    members: number,
  ) => void;
};

const planColors: {
  [key: string]: {
    bg: string;
    text: string;
    button: string;
    popular: string;
    border: string;
    rightIcon: string;
  };
} = {
  FREE: {
    bg: "bg-green-50",
    text: "text-green-800",
    button: "bg-green-500 text-white",
    popular: "bg-green-200",
    border: "border-green-300",
    rightIcon: "text-green-500",
  },
  BASIC: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    button: "bg-blue-500 text-white",
    popular: "bg-blue-200",
    border: "border-blue-300",
    rightIcon: "text-blue-500",
  },
  PREMIUM: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    button: "bg-purple-500 text-white",
    popular: "bg-purple-200",
    border: "border-purple-300",
    rightIcon: "text-purple-500",
  },
  ENTERPRISE: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    button: "bg-yellow-400 text-black",
    popular: "bg-yellow-200",
    border: "border-yellow-300",
    rightIcon: "text-yellow-500",
  },
};

const SubscriptionPlan = ({ school, onSelectPlan }: Props) => {
  const subscriptions = useGetListSubscription();
  const [monthprice, setMonthPrice] = useState(false);
  const language = useGetLanguage();
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

  const features = [
    "Basic Feature",
    "Users",
    "Total Storage Size",
    "Support",
    "Classroom_Limit",
    "Subject_Limit",
  ] as const;

  const calculateMaxSavings = () => {
    let maxSavings = 0;
    pricingData.slice(1).forEach((plan) => {
      const price = plan.price as any;
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

  return (
    <div className="flex min-h-dvh w-full items-center justify-center font-sans">
      <div className="mx-auto w-full max-w-7xl px-4 pb-10">
        <div className="flex flex-col items-center py-8 lg:py-14">
          <span className="text-base text-primary-color">
            {SubscriptionDataLanguage.pricing(language.data ?? "en")}
          </span>
          <span className="mb-6 mt-3 text-center text-4xl font-semibold sm:text-5xl">
            {SubscriptionDataLanguage.title(language.data ?? "en")}
          </span>
          <span className="text-center text-lg font-light sm:text-xl">
            {SubscriptionDataLanguage.description(language.data ?? "en")}
          </span>
          {/* billing type div */}
          <div className="m-auto mt-5 flex items-center justify-center space-x-1 rounded-2xl bg-gray-200 p-2 md:mt-10">
            <button
              onClick={() => setMonthPrice(true)}
              className={`w-40 rounded-2xl px-2 py-2 text-gray-600 transition-colors duration-300 sm:w-60 ${
                monthprice
                  ? "bg-white text-black shadow-md"
                  : "hover:bg-gray-300"
              }`}
            >
              {SubscriptionDataLanguage.monthly(language.data ?? "en")}
            </button>
            <button
              onClick={() => setMonthPrice(false)}
              className={`w-40 rounded-2xl px-2 py-2 text-gray-600 transition-colors duration-300 sm:w-60 ${
                !monthprice
                  ? "bg-white text-black shadow-md"
                  : "hover:bg-gray-300"
              }`}
            >
              {SubscriptionDataLanguage.annual(language.data ?? "en")}
            </button>
          </div>
          {!monthprice && (
            <div className="mt-4 text-center">
              <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
                Save up to {calculateMaxSavings()}%
              </span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {pricingData.slice(1).map((data, index) => {
            const colorScheme =
              planColors[data.mainTitle as keyof typeof planColors] ||
              planColors.FREE;
            return (
              <div
                key={index}
                className={`flex transform flex-col rounded-3xl p-6 transition-transform hover:scale-105 ${
                  colorScheme.bg
                } ${
                  data.popular
                    ? `border-4 ${colorScheme.border}`
                    : `border-2 ${colorScheme.border}`
                }`}
              >
                {data.popular && (
                  <div className={`mb-4 text-center`}>
                    <span
                      className={`rounded-full px-4 py-1 text-sm font-semibold ${colorScheme.popular} ${colorScheme.text}`}
                    >
                      {SubscriptionDataLanguage.popular(language.data ?? "en")}
                    </span>
                  </div>
                )}
                <div
                  className={`text-center text-2xl font-bold ${colorScheme.text}`}
                >
                  {language.data === "en" ? data.mainTitle : data.mainTitle_th}
                </div>
                <div className="my-4 text-center">
                  <div className="flex items-baseline justify-center gap-x-2">
                    <span
                      className={`text-5xl font-extrabold ${colorScheme.text}`}
                    >
                      {data.mainTitle === "FREE" ||
                      data.mainTitle === "PREMIUM" ||
                      data.mainTitle === "BASIC"
                        ? monthprice
                          ? language.data === "en"
                            ? data.price?.month
                            : (data.price as any)?.month_th
                          : language.data === "en"
                            ? data.price?.year
                            : (data.price as any)?.year_th
                        : null}
                      {data.mainTitle === "ENTERPRISE" && (
                        <>
                          {monthprice
                            ? (
                                (data.price as any)?.monthValue * members
                              ).toLocaleString()
                            : (
                                (data.price as any)?.yearValue * members
                              ).toLocaleString()}
                          ฿
                        </>
                      )}
                    </span>
                    {!monthprice && (data.price as any).monthValue > 0 && (
                      <span className="text-2xl text-gray-500 line-through">
                        {data.mainTitle === "ENTERPRISE"
                          ? (
                              (data.price as any).monthValue *
                              members *
                              12
                            ).toLocaleString()
                          : (
                              (data.price as any).monthValue * 12
                            ).toLocaleString()}
                        ฿
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-sm font-medium text-gray-500 ${colorScheme.text}`}
                  >
                    {data.price.permember
                      ? monthprice
                        ? SubscriptionDataLanguage.per_member_month(
                            language.data ?? "en",
                          )
                        : SubscriptionDataLanguage.per_member_year(
                            language.data ?? "en",
                          )
                      : monthprice
                        ? SubscriptionDataLanguage.monthly(
                            language.data ?? "en",
                          )
                        : SubscriptionDataLanguage.annual(
                            language.data ?? "en",
                          )}
                  </div>
                  {!monthprice && (data.price as any).yearValue > 0 && (
                    <div className="mt-2 flex justify-center">
                      <span className="rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
                        {SubscriptionDataLanguage.only(language.data ?? "en")}{" "}
                        {Math.round(
                          data.mainTitle === "ENTERPRISE"
                            ? ((data.price as any).yearValue * members) / 12
                            : (data.price as any).yearValue / 12,
                        ).toLocaleString()}
                        {SubscriptionDataLanguage.month_unit(
                          language.data ?? "en",
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <p className="h-16 text-center text-sm text-gray-600">
                  {language.data === "en" ? data.infoNote : data.infoNote_th}
                </p>

                <div className="flex-grow">
                  <ul className="my-6 space-y-3">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <RightIcon
                          className={`mr-2 h-6 w-6 flex-shrink-0 ${colorScheme.rightIcon}`}
                        />
                        <span className="text-sm text-gray-700">
                          <strong>
                            {language.data === "en"
                              ? pricingData[0][feature]
                              : (pricingData[0] as any)[`${feature}_th`]}
                            :
                          </strong>{" "}
                          {typeof (data as any)[feature] === "boolean"
                            ? "Available"
                            : language.data === "en"
                              ? (data as any)[feature]
                              : (data as any)[`${feature}_th`]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  {data.price.permember ? (
                    <div className="flex flex-col gap-2">
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
                        onClick={() => {
                          const prices = subscriptions.data.filter(
                            (s) => s.title === data.product,
                          );
                          const price = prices.find((p) =>
                            monthprice ? p.time === "month" : p.time === "year",
                          );

                          if (price?.priceId) {
                            onSelectPlan(
                              price?.priceId,
                              {
                                time: monthprice ? "month" : "year",
                                title: data.product as string,
                                price: monthprice
                                  ? (data.price.month as string)
                                  : (data.price.year as string),
                              },
                              members,
                            );
                          }
                        }}
                        className={`w-full transform rounded-2xl border-2 border-black py-3 font-semibold transition-transform hover:scale-105 ${
                          school.plan === data.mainTitle
                            ? "bg-white text-black"
                            : colorScheme.button
                        }`}
                      >
                        {school.plan === data.mainTitle
                          ? "Update Members"
                          : "Get Started"}
                      </button>
                    </div>
                  ) : data.price.month === "ไม่มี" && monthprice === true ? (
                    <div
                      className={`flex w-full transform cursor-not-allowed items-center justify-center rounded-2xl border-2 border-black bg-gray-300 py-3 font-semibold text-gray-500 transition-transform hover:scale-105`}
                    >
                      Not Available
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const prices = subscriptions.data.filter(
                          (s) => s.title === data.product,
                        );
                        const price = prices.find((p) =>
                          monthprice ? p.time === "month" : p.time === "year",
                        );

                        if (price?.priceId) {
                          onSelectPlan(
                            price?.priceId,
                            {
                              time: monthprice ? "month" : "year",
                              title: data.product as string,
                              price: monthprice
                                ? (data.price.month as string)
                                : (data.price.year as string),
                            },
                            1,
                          );
                        }
                      }}
                      disabled={school.plan === data.mainTitle}
                      className={`w-full transform rounded-2xl border-2 border-black py-3 font-semibold transition-transform hover:scale-105 ${
                        school.plan === data.mainTitle
                          ? "cursor-not-allowed bg-gray-300 text-gray-500"
                          : colorScheme.button
                      }`}
                    >
                      {school.plan === data.mainTitle
                        ? "You are on this plan"
                        : "Get Started"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default SubscriptionPlan;
