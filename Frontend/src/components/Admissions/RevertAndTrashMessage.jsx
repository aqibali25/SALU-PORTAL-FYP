import React, { useState } from "react";

const RevertAndTrashMessage = ({ open, onClose, onCancel, type }) => {
  const [message, setMessage] = useState("");

  if (!open) return null; // don't render if closed

  // Configuration based on type
  const config = {
    revert: {
      title: "Revert Form",
      placeholder: "Please provide remarks for reverting this form...",
      buttonText: "Revert",
      description:
        "This form will be sent back to the candidate for corrections.",
    },
    trash: {
      title: "Move to Trash",
      placeholder: "Please provide remarks for moving this form to trash...",
      buttonText: "Move to Trash",
      description: "This form will be moved to the trash folder.",
    },
  };

  const { title, placeholder, buttonText, description } =
    config[type] || config.revert;

  const handleSend = () => {
    if (message.trim() === "") {
      alert("Please type a message before sending!");
      return;
    }

    // Pass the message/remarks to the parent component
    onClose(message);
    setMessage(""); // Reset message after sending
  };

  const handleCancel = () => {
    setMessage(""); // Reset message on cancel
    onCancel(); // Call the cancel callback
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 cursor-pointer"
      onClick={handleCancel}
    >
      <div
        className="flex justify-center items-center flex-col gap-4 
          bg-white dark:bg-gray-800 rounded-md shadow-md !p-6 
          w-[500px] max-w-[90%] text-gray-900 dark:text-gray-100 cursor-auto"
        onClick={(e) => e.stopPropagation()} // prevent overlay close on inner click
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
        </div>

        {/* Textarea */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Remarks:
          </label>
          <textarea
            className="w-full h-32 border-2 border-gray-400 dark:border-gray-300 !p-3
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
              outline-none resize-none
              focus:border-[#e5b300] focus:ring-1 focus:ring-[#e5b300]
              disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4 w-full">
          {/* Cancel button */}
          <button
            type="button"
            onClick={handleCancel}
            className="cursor-pointer relative overflow-hidden !px-[10px] !py-[5px] border-2 border-[#e5b300] text-black dark:text-white hover:text-white hover:dark:text-black text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                     before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-0 before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-full disabled:opacity-60"
          >
            <span className="relative z-10">Cancel</span>
          </button>

          {/* Action button (Revert/Move to Trash) */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim()}
            className="cursor-pointer relative overflow-hidden !px-[20px] !py-[5px] border-2 border-[#e5b300] text-white hover:text-black hover:dark:text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                     before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
          >
            <span className="relative z-10">{buttonText}</span>
          </button>
        </div>

        {/* Optional: Character count or validation message */}
        <div className="w-full text-right">
          <span
            className={`text-xs ${
              message.trim() ? "text-green-600" : "text-gray-500"
            }`}
          >
            {message.trim() ? "Ready to submit" : "Remarks required"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevertAndTrashMessage;
