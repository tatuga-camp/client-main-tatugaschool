import React, { useRef, useState } from "react";
import { School } from "@/interfaces";
import { InputMask } from "primereact/inputmask";
import { UseMutationResult } from "@tanstack/react-query";
import { RequestUpdateSchoolService } from "@/services";
import { Toast } from "primereact/toast";
interface ProfileFormProps {
  school: School;
  updateSchool: UseMutationResult<
    School,
    Error,
    RequestUpdateSchoolService,
    unknown
  >;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ school, updateSchool }) => {
  const toast = useRef<Toast>(null);
  const [isActive, setIsActive] = useState(false);
  const [formData, setFormData] = useState({
    title: school.title,
    phoneNumber: school.phoneNumber,
    country: school.country,
    city: school.city,
    zip: school.zipCode,
    about: school.description,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
    setIsActive(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateSchool.mutateAsync({
      query: { schoolId: school.id },
      body: formData,
    });

    toast.current?.show({
      severity: "info",
      summary: "Updated",
      detail: "School has been updated",
    });
    setIsActive(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full p-6 bg-white rounded-xl space-y-4"
    >
      <div>
        <label className="block text-gray-500 text-sm mb-1" htmlFor="title">
          Name
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={handleChange}
          className="main-input w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-500 text-sm mb-1" htmlFor="phone">
            Phone
          </label>
          <InputMask
            mask="(+99) 999-999-9999"
            value={formData.phoneNumber}
            onChange={(e) => {
              setFormData((prev) => {
                return { ...prev, phoneNumber: e.value as string };
              });
              setIsActive(true);
            }}
            className="main-input w-full"
            id="phoneNumber"
          />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1" htmlFor="country">
            Country
          </label>
          <input
            type="text"
            id="country"
            value={formData.country}
            onChange={handleChange}
            className="main-input w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-500 text-sm mb-1" htmlFor="city">
            City
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={handleChange}
            className="main-input w-full"
          />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1" htmlFor="zip">
            Zip/Code
          </label>
          <input
            type="text"
            id="zip"
            value={formData.zip}
            onChange={handleChange}
            className="main-input w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-500 text-sm mb-1" htmlFor="about">
          About
        </label>
        <textarea
          id="about"
          rows={4}
          value={formData.about}
          onChange={handleChange}
          className="main-input w-full"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={!isActive}
        className={`w-60 py-2 text-white rounded-md focus:outline-none ${
          !isActive
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-primary-color hover:bg-primary-color-hover"
        }`}
      >
        Save Changes
      </button>
    </form>
  );
};

export default ProfileForm;
