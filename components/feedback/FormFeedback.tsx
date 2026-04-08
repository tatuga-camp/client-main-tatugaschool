import React, { useState } from "react";
import PopupLayout from "../layout/PopupLayout";
import TextEditor from "../common/TextEditor";

type FormFeedbackProps = {
  onSubmit: (feedback: string) => void;
  onClose: () => void;
  schoolId: string;
};

const FormFeedback = ({ onSubmit, onClose, schoolId }: FormFeedbackProps) => {
  const [feedback, setFeedback] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feedback);
    setFeedback("");
    onClose();
    setIsOpen(false);
  };

  const handleOpenFeedback = () => {
    setIsOpen(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpenFeedback}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-700"
          aria-label="Open feedback form"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        </button>
      )}

      {isOpen && (
        <PopupLayout onClose={handleCancel}>
          <div className="mx-4 -ml-[100px] w-full max-w-2xl rounded-lg bg-white p-6">
            <h2 className="mb-4 text-2xl font-semibold">Send Feedback</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Your Feedback
                </label>
                <div className="h-64 rounded-lg border">
                  <TextEditor
                    value={feedback}
                    onChange={setFeedback}
                    schoolId={schoolId}
                    menubar={false}
                    toolbar="bold italic | bullist numlist | link image"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  aria-label="Cancel feedback"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  aria-label="Submit feedback"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </PopupLayout>
      )}
    </>
  );
};

export default FormFeedback;
