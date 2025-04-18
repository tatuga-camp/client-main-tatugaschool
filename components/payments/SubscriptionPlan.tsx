import { useState } from "react";
import { School } from "../../interfaces";
import { useGetListSubscription } from "../../react-query";
import LoadingBar from "../common/LoadingBar";
import InputNumber from "../common/InputNumber";
const pricingData = [
  {
    mainTitle: "",
    price: {
      month: null,
      year: null,
      permember: false,
    },
    popular: false,
    product: false,
    infoNote: "",
    "Basic Feature": "Basic Feature",
    Users: "Members in a school",
    "Total Storage Size": "Total Storage Size",
    Support: "Direct Chat Support",
    Classroom_Limit: "Classroom Limit",
    Subject_Limit: "Subject Limit",
  },
  {
    mainTitle: "FREE",
    popular: false,
    product: false,
    price: {
      month: "Free",
      year: "Free",
      monthValue: 0,
      yearValue: 0,
      permember: false,
    },
    infoNote: "Free plan is good for 1 teacher in a school.",
    "Basic Feature": true,
    Users: 2,
    "Total Storage Size": "15GB",
    Support: false,
    Classroom_Limit: "3 classrooms",
    Subject_Limit: "3 subjects",
  },
  {
    mainTitle: "PREMIUM",
    product: "Tatuga School Premium",
    popular: true,
    price: {
      month: "290฿",
      monthValue: 290,
      year: "2,490฿",
      yearValue: 2490,
      permember: false,
    },
    infoNote: "Premium plan is good for 1 - 3 teachers in a school",
    "Basic Feature": true,
    Users: 3,
    "Total Storage Size": "100GB",
    Support: true,
    Classroom_Limit: "20 classrooms",
    Subject_Limit: "30 subjects",
  },
  {
    popular: false,
    mainTitle: "ENTERPRISE",
    product: "Tatuga School Enterprise",
    price: {
      month: "150฿",
      monthValue: 150,
      year: "1,100฿",
      yearValue: 1100,
      permember: true,
    },
    infoNote:
      "Enterprise plan is good for a school that has more than 5 teachers",
    "Basic Feature": true,
    Users: "custom",
    "Total Storage Size": "9.77 TB",
    Support: true,
    Classroom_Limit: "Unlimited",
    Subject_Limit: "Unlimited",
  },
] as const;

const RightIcon = ({ bgcolor }: { bgcolor: string }) => {
  return (
    <svg
      className="w-5 h-5 mt-1"
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
    members: number
  ) => void;
};
const SubscriptionPlan = ({ school, onSelectPlan }: Props) => {
  const subscriptions = useGetListSubscription();
  const [monthprice, setMonthPrice] = useState(true);
  const [members, setMembers] = useState(
    school.limitSchoolMember < 4 ? 4 : school.limitSchoolMember
  );
  if (subscriptions.isLoading || !subscriptions.data) {
    return (
      <div className="mt-5">
        <LoadingBar />
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] w-full flex items-center justify-center">
      <div className="w-full pb-10">
        <div className="py-8 lg:py-14 flex flex-col items-center">
          <span className="text-primary-color text-base">Pricing</span>
          <span className="font-semibold text-center text-4xl sm:text-5xl mt-3 mb-6">
            Compare our plans and find yours
          </span>
          <span className="sm:text-xl text-center text-lg font-light">
            Select a plan that match to your needs!
          </span>
          {/* billing type div */}
          <div className="px-2 py-2  m-auto mt-5 md:mt-10 space-x-1 flex justify-center items-center rounded-lg">
            <button
              onClick={() => setMonthPrice(true)}
              className={`py-2 px-2 md:px-1.5 sm:px-3.5 drop-shadow-md hover:bg-white text-[#667085] hover:text-black rounded-md
                ${
                  monthprice && "bg-white border-[#94a3b8] border text-black "
                }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setMonthPrice(false)}
              className={`ml-1 py-2 px-2 md:px-1.5 sm:px-3.5 border-[#94a3b8] drop-shadow-md hover:bg-white text-[#667085]  hover:text-black rounded-md
                ${!monthprice && "bg-white border-[#94a3b8] border text-black"}
              `}
            >
              Annual billing
            </button>
          </div>
        </div>
        <div className="w-full  mx-auto  rounded-xl">
          <table className="w-full text-start border-spacing-5 border-separate flex flex-col lg:flex-row p-5 lg:p-0">
            {pricingData.map((data, index) => (
              <tbody
                key={index}
                className={
                  index === 0
                    ? "hidden lg:block"
                    : "border-2 lg:border-none mb-10 lg:mb-0 rounded-lg"
                }
              >
                <tr>
                  <td>
                    <div className="font-semibold text-xl text-[#101828] h-7">
                      {data.mainTitle}
                      {data.popular && (
                        <span className="text-sm font-medium text-primary-color px-2.5 py-0.5 bg-[#F9F5FF] rounded-2xl ml-2">
                          Popular
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="h-[50px]">
                    <div className="w-max">
                      {(data.mainTitle === "FREE" ||
                        data.mainTitle === "PREMIUM") && (
                        <span className="font-semibold text-5xl">
                          {monthprice ? data.price?.month : data.price?.year}
                        </span>
                      )}
                      {data.mainTitle === "ENTERPRISE" && (
                        <span className="font-semibold text-5xl">
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
                        <span className="text-[#475467] font-normal ml-1">
                          {data.price.permember
                            ? monthprice
                              ? "Per member/month"
                              : "Per member/year"
                            : monthprice
                            ? "per month"
                            : "per year"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="h-[50px]  lg:h-[70px] xl:h-[50px]">
                    <span className="text-[#475467] text-sm font-normal">
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
                        <div className="w-full flex items-center justify-center gap-2">
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
                                (s) => s.title === data.product
                              );
                              const price = prices.find((p) =>
                                monthprice
                                  ? p.time === "month"
                                  : p.time === "year"
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
                                  members
                                );
                              }
                            }}
                            className={`w-full ${
                              school.plan === data.mainTitle
                                ? "second-button text-black border"
                                : "main-button text-white"
                            }  rounded-lg py-3 font-semibold`}
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
                              (s) => s.title === data.product
                            );
                            const price = prices.find((p) =>
                              monthprice
                                ? p.time === "month"
                                : p.time === "year"
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
                                1
                              );
                            }
                          }}
                          disabled={school.plan === data.mainTitle}
                          className={`w-full ${
                            school.plan === data.mainTitle
                              ? "second-button text-black border"
                              : "main-button text-white"
                          }  rounded-lg py-3 font-semibold`}
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
                        : "h-7 flex justify-between lg:justify-center flex-row-reverse"
                    }
                  >
                    <span className="text-sm font-semibold text-[#60a5fa]">
                      {data["Basic Feature"] === true ? (
                        <>
                          <RightIcon bgcolor={`#365CCE`} />
                        </>
                      ) : (
                        <span className="font-medium text-sm text-[#101828] ">
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
                        : "h-6 text-center flex justify-between lg:justify-center flex-row-reverse"
                    }
                  >
                    <span className="font-medium text-sm text-[#101828]">
                      {data.Users}
                    </span>
                    <span className="lg:hidden">{pricingData[0]["Users"]}</span>
                  </td>
                </tr>
                <tr>
                  <td
                    className={
                      index === 0
                        ? "h-5"
                        : "h-7 text-center flex justify-between lg:justify-center flex-row-reverse"
                    }
                  >
                    <span className="font-medium text-sm text-[#101828]">
                      {data["Total Storage Size"]}
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
                        : "h-7 flex justify-between lg:justify-center flex-row-reverse"
                    }
                  >
                    {data.Support === true ? (
                      <>
                        <RightIcon bgcolor={`#365CCE`} />
                      </>
                    ) : (
                      <span className="font-medium text-sm text-[#101828]">
                        {data.Support}
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
                        : "h-7 text-center flex justify-between lg:justify-center flex-row-reverse"
                    }
                  >
                    <span className="font-medium text-sm text-[#101828]">
                      {data.Classroom_Limit}
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
                        : "h-7 text-center flex justify-between lg:justify-center flex-row-reverse"
                    }
                  >
                    <span className="font-medium text-sm text-[#101828]">
                      {data.Subject_Limit}
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
