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
      month: "190฿",
      year: "1,390฿",
      monthValue: 190,
      yearValue: 1390,
      permember: false,
    },
    infoNote: "Basic plan is good for 1 - 2 teachers in a school",
    infoNote_th: "แผนพื้นฐานเหมาะสำหรับครู 1 - 2 คนในโรงเรียน",
    "Basic Feature": true,
    Users: 2,
    Users_th: 2,
    "Total Storage Size": "15GB",
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
      monthValue: 290,
      year: "2,490฿",
      yearValue: 2490,
      permember: false,
    },
    infoNote: "Premium plan is good for 1 - 3 teachers in a school",
    infoNote_th: "แผนพรีเมียมเหมาะสำหรับครู 1 - 3 คนในโรงเรียน",
    "Basic Feature": true,
    Users: 3,
    Users_th: 3,

    "Total Storage Size": "100GB",
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
      monthValue: 150,
      year: "1,100฿",
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
    Support: true,
    Classroom_Limit: "Unlimited",
    Classroom_Limit_th: "ไม่จำกัด",
    Subject_Limit: "Unlimited",
    Subject_Limit_th: "ไม่จำกัด",
  },
] as const;

const RightIcon = ({ bgcolor }: { bgcolor: string }) => {
  return (
    <svg
      className="mt-1 h-5 w-5"
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.8267 26.817L24.3485 36.3763L42.6482 18.1795"
        stroke={bgcolor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="28" r="26" stroke={bgcolor} strokeWidth="4" />
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
const SubscriptionPlan = ({ school, onSelectPlan }: Props) => {
  const subscriptions = useGetListSubscription();
  const [monthprice, setMonthPrice] = useState(true);
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

  return (
    <div className="flex min-h-dvh w-full items-center justify-center">
      <div className="w-full pb-10">
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
          <div className="m-auto mt-5 flex items-center justify-center space-x-1 rounded-2xl px-2 py-2 md:mt-10">
            <button
              onClick={() => setMonthPrice(true)}
              className={`w-60 rounded-2xl px-2 py-2 text-[#667085] drop-shadow-md hover:bg-white hover:text-black sm:px-3.5 md:px-1.5 ${
                monthprice && "border border-[#94a3b8] bg-white text-black"
              }`}
            >
              {SubscriptionDataLanguage.monthly(language.data ?? "en")}
            </button>
            <button
              onClick={() => setMonthPrice(false)}
              className={`ml-1 w-60 rounded-2xl border-[#94a3b8] px-2 py-2 text-[#667085] drop-shadow-md hover:bg-white hover:text-black sm:px-3.5 md:px-1.5 ${!monthprice && "border border-[#94a3b8] bg-white text-black"} `}
            >
              {SubscriptionDataLanguage.annual(language.data ?? "en")}
            </button>
          </div>
        </div>
        <div className="mx-auto w-full overflow-auto rounded-xl">
          <table className="flex w-max min-w-full border-separate border-spacing-5 flex-col p-5 text-start lg:flex-row lg:p-0">
            {pricingData.map((data, index) => (
              <tbody
                key={index}
                className={
                  index === 0
                    ? "hidden lg:block"
                    : "mb-10 rounded-2xl border-2 lg:mb-0 lg:border-none"
                }
              >
                <tr>
                  <td>
                    <div className="h-7 text-xl font-semibold text-[#101828]">
                      {data.mainTitle}
                      {data.popular && (
                        <span className="ml-2 rounded-2xl bg-[#F9F5FF] px-2.5 py-0.5 text-sm font-medium text-primary-color">
                          {SubscriptionDataLanguage.popular(
                            language.data ?? "en",
                          )}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="h-[50px]">
                    <div className="w-max">
                      {(data.mainTitle === "FREE" ||
                        data.mainTitle === "PREMIUM" ||
                        data.mainTitle === "BASIC") && (
                        <span className="text-5xl font-semibold">
                          {monthprice ? data.price?.month : data.price?.year}
                        </span>
                      )}
                      {data.mainTitle === "ENTERPRISE" && (
                        <span className="text-5xl font-semibold">
                          {monthprice
                            ? (
                                data.price?.monthValue * members
                              ).toLocaleString()
                            : (
                                data.price?.yearValue * members
                              ).toLocaleString()}
                          ฿
                        </span>
                      )}
                      {data.price && (
                        <span className="ml-1 font-normal text-[#475467]">
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
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="h-[50px] lg:h-[70px] xl:h-[50px]">
                    <span className="text-sm font-normal text-[#475467]">
                      {data.infoNote}
                    </span>
                  </td>
                </tr>
                <tr>
                  {index === 0 ? (
                    <td className="h-[50px]"></td>
                  ) : (
                    <td>
                      {data.price.permember ? (
                        <div className="flex w-full items-center justify-center gap-2">
                          <InputNumber
                            placeholder="Enter number of members"
                            min={4}
                            max={500}
                            value={members}
                            onValueChange={(data) => {}}
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
                                monthprice
                                  ? p.time === "month"
                                  : p.time === "year",
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
                            className={`w-full ${
                              school.plan === data.mainTitle
                                ? "second-button border text-black"
                                : "main-button text-white"
                            } rounded-2xl py-3 font-semibold`}
                          >
                            {school.plan === data.mainTitle
                              ? "Update Members"
                              : "Get Started"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const prices = subscriptions.data.filter(
                              (s) => s.title === data.product,
                            );
                            const price = prices.find((p) =>
                              monthprice
                                ? p.time === "month"
                                : p.time === "year",
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
                          className={`w-full ${
                            school.plan === data.mainTitle
                              ? "second-button border text-black"
                              : "main-button text-white"
                          } rounded-2xl py-3 font-semibold`}
                        >
                          {school.plan === data.mainTitle
                            ? "You are on this plan"
                            : "Get Started"}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
                {/* portion after first title */}

                <tr>
                  <td
                    className={
                      index === 0
                        ? "w-40"
                        : "flex h-7 flex-row-reverse justify-between lg:justify-center"
                    }
                  >
                    <span className="text-sm font-semibold text-[#60a5fa]">
                      {data["Basic Feature"] === true ? (
                        <>
                          <RightIcon bgcolor={`#365CCE`} />
                        </>
                      ) : (
                        <span className="text-sm font-medium text-[#101828]">
                          Basic Feature
                        </span>
                      )}
                    </span>
                    <span className="lg:hidden">
                      {pricingData[0]["Basic Feature"]}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td
                    className={
                      index === 0
                        ? "h-5 lg:w-60"
                        : "flex h-6 flex-row-reverse justify-between text-center lg:justify-center"
                    }
                  >
                    <span className="text-sm font-medium text-[#101828]">
                      {language.data === "en" ? data.Users : data.Users_th}
                    </span>
                    <span className="lg:hidden">{pricingData[0]["Users"]}</span>
                  </td>
                </tr>
                <tr>
                  <td
                    className={
                      index === 0
                        ? "h-5"
                        : "flex h-7 flex-row-reverse justify-between text-center lg:justify-center"
                    }
                  >
                    <span className="text-sm font-medium text-[#101828]">
                      {index === 0 && language.data === "en"
                        ? data["Total Storage Size"]
                        : index === 0 && language.data === "th"
                          ? pricingData[0]["Total Storage Size_th"]
                          : data["Total Storage Size"]}
                    </span>
                    <span className="lg:hidden">
                      {pricingData[0]["Total Storage Size"]}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td
                    className={
                      index === 0
                        ? "h-7"
                        : "flex h-7 flex-row-reverse justify-between lg:justify-center"
                    }
                  >
                    {data.Support === true ? (
                      <>
                        <RightIcon bgcolor={`#365CCE`} />
                      </>
                    ) : (
                      <span className="text-sm font-medium text-[#101828]">
                        {language.data === "en"
                          ? data.Support
                          : data.Support_th}
                      </span>
                    )}
                    <span className="lg:hidden">
                      {pricingData[0]["Support"]}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td
                    className={
                      index === 0
                        ? "h-5"
                        : "flex h-7 flex-row-reverse justify-between text-center lg:justify-center"
                    }
                  >
                    <span className="text-sm font-medium text-[#101828]">
                      {language.data === "en"
                        ? data.Classroom_Limit
                        : data.Classroom_Limit_th}
                    </span>
                    <span className="lg:hidden">
                      {pricingData[0]["Classroom_Limit"]}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td
                    className={
                      index === 0
                        ? "h-5"
                        : "flex h-7 flex-row-reverse justify-between text-center lg:justify-center"
                    }
                  >
                    <span className="text-sm font-medium text-[#101828]">
                      {language.data === "en"
                        ? data.Subject_Limit
                        : data.Subject_Limit_th}
                    </span>
                    <span className="lg:hidden">
                      {pricingData[0]["Subject_Limit"]}
                    </span>
                  </td>
                </tr>
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
};
export default SubscriptionPlan;
