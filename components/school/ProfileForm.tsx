import { ErrorMessages, School } from "@/interfaces";
import { RequestUpdateSchoolService } from "@/services";
import { UseMutationResult } from "@tanstack/react-query";
import { Toast } from "primereact/toast";
import React, { useRef, useState } from "react";
import { PhoneInput } from "react-international-phone";
import Swal from "sweetalert2";
import useGetRoleOnSchool from "../../hook/useGetRoleOnSchool";
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
  const role = useGetRoleOnSchool({
    schoolId: school.id,
  });
  const [formData, setFormData] = useState({
    title: school.title,
    phoneNumber: school.phoneNumber,
    country: school.country,
    city: school.city,
    zip: school.zipCode,
    about: school.description,
    address: school.address,
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
    try {
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
    } catch (error) {
      setIsActive(false);
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
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <div>
        <label className="block text-gray-500 text-sm mb-1" htmlFor="title">
          Name
        </label>
        <input
          type="text"
          id="title"
          disabled={role === "TEACHER"}
          value={formData.title}
          onChange={handleChange}
          className="main-input w-full"
        />
      </div>

      <div>
        <label className="block text-gray-500 text-sm mb-1" htmlFor="phone">
          Phone
        </label>
        <PhoneInput
          required
          disabled={role === "TEACHER"}
          defaultCountry="th"
          value={formData.phoneNumber}
          onChange={(e) => {
            setFormData((prev) => {
              return { ...prev, phoneNumber: e };
            });
            setIsActive(true);
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-500 text-sm mb-1" htmlFor="address">
            address
          </label>
          <input
            disabled={role === "TEACHER"}
            type="text"
            required
            id="address"
            className="main-input w-full"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1" htmlFor="country">
            Country
          </label>
          <input
            disabled={role === "TEACHER"}
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
            disabled={role === "TEACHER"}
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
            disabled={role === "TEACHER"}
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
          disabled={role === "TEACHER"}
          value={formData.about}
          onChange={handleChange}
          className="main-input w-full"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={!isActive || role === "TEACHER"}
        className={`w-40 py-2 text-white rounded-md focus:outline-none ${
          !isActive
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-primary-color hover:bg-primary-color-hover"
        }`}
      >
        Save Changes
      </button>
      {role === "TEACHER" && (
        <span className="text-red-600">
          You are not allow to make any change because you are not an admin.
        </span>
      )}
    </form>
  );
};

export default ProfileForm;
