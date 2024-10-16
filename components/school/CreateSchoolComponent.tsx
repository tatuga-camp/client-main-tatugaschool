import { School } from "@/interfaces";
import { CreateSchoolService, RequestCreateSchoolService } from "@/services";
import { useRouter } from "next/router";
import { useState } from "react";

const CreateSchoolComponent = () => {
  const router = useRouter();
  const inputClasses = "border rounded-md px-6 py-4";
  const [school, setSchool] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const input: RequestCreateSchoolService  = { title: school, description };
    try {
      const response = await CreateSchoolService(input);
      console.log("School created successfully:", response);
      router.back();
    } catch (error) {
      console.error("Failed to create school:", error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-md p-12">
      <h2 className="text-xl font-semibold text-center text-black mb-8">
        Create your School here!
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col mb-6">
          <input
            type="text"
            className={inputClasses}
            placeholder="School"
            aria-label="School Name"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
        </div>
        <div className="flex flex-col mb-8">
          <input
            type="text"
            className={inputClasses}
            placeholder="Description"
            aria-label="School Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#6f47dd] text-white py-4 rounded-lg font-semibold"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateSchoolComponent;
