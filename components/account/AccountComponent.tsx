import React, { useEffect, useState } from "react";
import UploadPhoto from "./UploadPhoto";

import Swal from "sweetalert2";

import { useRouter } from "next/router";
import { ProgressSpinner } from "primereact/progressspinner";
import { PhoneInput } from "react-international-phone";
import { ErrorMessages } from "../../interfaces";
import { useGetLanguage, useGetUser, useUpdateUser } from "../../react-query";
import ChangePassword from "./ChangePassword";
import ManageInvite from "./ManageInvite";
import { accountDataLanguage } from "../../data/languages";

const menuItems = ["General", "Password", "Invitations"] as const;
type MenuItems = (typeof menuItems)[number];
const AccountComponent = () => {
  const language = useGetLanguage();
  const router = useRouter();
  const [selectMenu, setSelectMenu] = useState<MenuItems>("General");
  const user = useGetUser();
  const [form, setForm] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
  }>();

  const updateUser = useUpdateUser();

  useEffect(() => {
    if (router.isReady) {
      setSelectMenu(() => {
        if (!menuItems.includes(router.query.menu as any)) {
          console.log(router.query.menu);
          return "General";
        } else {
          return router.query.menu as MenuItems;
        }
      });
    }
  }, [router.isReady]);

  useEffect(() => {
    if (user.data) {
      setForm({
        firstName: user.data.firstName,
        lastName: user.data.lastName,
        phone: user.data.phone,
      });
    }
  }, [user.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateUser.mutateAsync({
        ...form,
      });
      Swal.fire({
        title: "Account updated successfully",
        icon: "success",
      });
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
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-lg p-8">
        <h2 className="text-3xl font-semibold text-[#6f47dd] mb-4">
          {accountDataLanguage.title(language.data ?? "en")}
        </h2>
        <p className="text-gray-600 mb-8">
          {accountDataLanguage.description(language.data ?? "en")}{" "}
        </p>

        <div className="border-b mb-6 overflow-auto">
          <ul className="flex space-x-8 text-[#6f47dd]">
            {menuItems.map((item, index) => (
              <li
                onClick={() => setSelectMenu(item)}
                key={item}
                className={`border-b-2 cursor-pointer ${
                  selectMenu === item && "border-b-primary-color "
                }  pb-2`}
              >
                {accountDataLanguage[
                  item.toLocaleLowerCase() as keyof typeof accountDataLanguage
                ](language.data ?? "en")}
              </li>
            ))}
          </ul>
        </div>

        {selectMenu === "General" && (
          <div className="flex flex-col md:flex-row gap-8">
            {user.data && (
              <UploadPhoto updateUser={updateUser} user={user.data} />
            )}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 md:w-2/3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  placeholder="First Name"
                  name="firstName"
                  value={form?.firstName}
                  onChange={handleChange}
                />
                <InputField
                  placeholder="Last Name"
                  name="lastName"
                  value={form?.lastName}
                  onChange={handleChange}
                />
                <InputField
                  placeholder="E-mail"
                  name="email"
                  disabled
                  value={user.data?.email}
                  onChange={handleChange}
                />
                <PhoneInput
                  required
                  defaultCountry="th"
                  placeholder="Phone"
                  value={form?.phone}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, phone: e }));
                  }}
                />
              </div>
              {updateUser.isPending ? (
                <div className="w-60 flex items-center">
                  <ProgressSpinner
                    animationDuration="1s"
                    style={{ width: "20px" }}
                    className="w-5 h-5"
                    strokeWidth="8"
                  />
                </div>
              ) : (
                <button type="submit" className="w-60 main-button">
                  {accountDataLanguage.save(language.data ?? "en")}
                </button>
              )}
            </form>
          </div>
        )}

        {selectMenu === "Password" && <ChangePassword />}
        {selectMenu === "Invitations" && <ManageInvite />}
      </div>
    </div>
  );
};

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  name,
  value,
  disabled,
  placeholder,
  onChange,
}) => (
  <input
    type="text"
    disabled={disabled}
    placeholder={placeholder}
    name={name}
    className="main-input"
    value={value}
    onChange={onChange}
  />
);

export default AccountComponent;
