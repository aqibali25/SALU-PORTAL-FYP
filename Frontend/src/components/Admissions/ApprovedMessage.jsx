import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const ApprovedMessage = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 cursor-pointer">
      <div
        className="flex justify-center items-center flex-col gap-6 bg-white dark:bg-gray-800 rounded-lg !p-8 w-[90%] max-w-md text-center cursor-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <FaCheckCircle className="text-6xl text-black dark:text-white mx-auto mb-6" />

        <h2 className="text-2xl font-semibold text-black dark:text-white mb-6">
          APPROVED SUCCESSFULLY
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer relative overflow-hidden !px-[10px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                     before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
        >
          <span className="relative z-10">Continue</span>
        </button>
      </div>
    </div>
  );
};

export default ApprovedMessage;
