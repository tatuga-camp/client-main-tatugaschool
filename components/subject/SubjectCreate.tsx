import React from "react";
import { IoMdClose } from "react-icons/io";
import InputWithIcon from "../common/InputWithIcon";
import { MdOutlineSubtitles, MdTitle } from "react-icons/md";
import InputEducationYear from "../common/InputEducationYear";
import { FiPlus } from "react-icons/fi";

type Props = {
  onClose: () => void;
};
function SubjectCreate({ onClose }: Props) {
  return (
    <div className="w-4/12 h-4/6 bg-white p-3 rounded-md flex flex-col gap-2 ">
      <header className="w-full flex justify-between border-b">
        <h1 className="font-semibold text-lg">Create subject</h1>
        <button
          onClick={() => onClose()}
          className="text-lg hover:bg-gray-300/50 w-6 h-6 rounded flex items-center justify-center font-semibold"
        >
          <IoMdClose />
        </button>
      </header>
      <form className="flex flex-col pt-5 h-96 overflow-auto gap-2">
        <div className="flex flex-col">
          <span>Education Year</span>
          <InputEducationYear value="" onChange={(value) => {}} />
        </div>
        <InputWithIcon
          title="Name"
          value=""
          onChange={() => {}}
          placeholder="Enter subject name"
          icon={<MdOutlineSubtitles />}
        />
        <InputWithIcon
          title="Description"
          value=""
          onChange={() => {}}
          placeholder="Enter subject description"
          icon={<MdOutlineSubtitles />}
        />
      </form>

      <div className="w-full px-3  py-2  border-t justify-end gap-3 flex">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              onClose();
            }}
            type="button"
            className="second-button border flex items-center justify-center gap-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="main-button flex items-center justify-center gap-1"
          >
            <FiPlus /> Create Subject
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubjectCreate;
