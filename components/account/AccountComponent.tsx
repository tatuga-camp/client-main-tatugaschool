import React, {
  useEffect,
  useMemo,
  useCallback,
  useState,
  ChangeEvent,
} from "react";
import UploadPhoto from "./UploadPhoto";
import useUserStore from "@/store/userStore";
import useAccountStore from "@/store/accountStore";
import Swal from "sweetalert2";

import { UpdateUserService, UserService } from "@/services";

const AccountComponent = () => {
  const { user, setUser } = useUserStore();
  const { photo } = useAccountStore();

  const [form, setForm] = useState({
    firstname: user?.firstName || "",
    lastname: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    photo: photo || user?.photo || "",
  });

  const userMemo = useMemo(() => user, [user]);
  const photoMemo = useMemo(() => photo, [photo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await UpdateUserService(form);

      Swal.fire({
        title: "Account updated successfully",
        icon: "success",
      });

      const res = await UserService();
      setUser(res);
    } catch (error) {
      Swal.fire({
        title: "Error updating account",
        icon: "error",
        text: "An error occurred while updating the account",
      });
    }
  };

  useEffect(() => {
    if (userMemo) {
      setForm({
        firstname: userMemo.firstName || "",
        lastname: userMemo.lastName || "",
        email: userMemo.email || "",
        phone: userMemo.phone || "",
        photo: photoMemo || userMemo.photo || "",
      });
    }
  }, [userMemo]);

  useEffect(() => {
    if (photo) setForm((prev) => ({ ...prev, photo: photo }));
  }, [photo]);

  return (
    <div className="min-h-[90vh] flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-lg p-8">
        <h2 className="text-3xl font-semibold text-[#6f47dd] mb-4">Account</h2>
        <p className="text-gray-600 mb-8">
          Manage your account and personal information
        </p>

        <div className="border-b mb-6 overflow-auto">
          <ul className="flex space-x-8 text-[#6f47dd]">
            <li className="border-b-2 border-[#6f47dd] pb-2">General</li>
            <li className="pb-2">Notifications</li>
            <li className="pb-2">Change Password</li>
          </ul>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <UploadPhoto />
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 md:w-2/3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
              />
              <InputField
                label="Last Name"
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
              />
              <InputField
                label="E-mail"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
              <InputField
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              className="bg-[#6f47dd] text-white px-6 py-2 rounded-lg self-end mt-4"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
}) => (
  <input
    type="text"
    placeholder={label}
    name={name}
    className="border rounded-md px-4 py-2"
    defaultValue={value}
    onChange={onChange}
  />
);

export default AccountComponent;
