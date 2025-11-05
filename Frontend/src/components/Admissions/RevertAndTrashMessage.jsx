import React, { useState } from "react";

const RevertAndTrashMessage = ({ open, onClose, onCancel }) => {
  const [message, setMessage] = useState("");

  if (!open) return null; // don’t render if closed

  const handleSend = () => {
    if (message.trim() === "") {
      alert("Please type a message before sending!");
      return;
    }
    console.log("Message sent:", message);
    setMessage("");
    onClose(); // after send we redirect
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 cursor-pointer"
      onClick={onCancel}
    >
      <div
        className="flex justify-center items-center flex-col gap-4 
          bg-white dark:bg-gray-800 rounded-md shadow-md !p-6 
          w-[500px] max-w-[90%] text-gray-900 dark:text-gray-100 cursor-auto"
        onClick={(e) => e.stopPropagation()} // prevent overlay close on inner click
      >
        {/* Header */}
        <h2 className="text-lg font-semibold mb-3">Message For Candidate</h2>

        {/* Textarea */}
        <textarea
          className="w-full h-50 border-2 border-[#a5a5a5] !p-2
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            outline-none resize-none
            disabled:opacity-60 disabled:cursor-not-allowed"
          placeholder="Type Something here......."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          {/* Cancel just hides modal */}
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer relative overflow-hidden !px-[10px] !py-[5px] 
              border-2 border-[#e5b300] text-gray-900 dark:text-white 
              text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
              before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full 
              before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear 
              hover:before:h-0 disabled:opacity-60"
          >
            <span className="relative z-10">Cancel</span>
          </button>

          {/* Send redirects (onClose) */}
          <button
            type="button"
            onClick={handleSend}
            className="cursor-pointer relative overflow-hidden !px-[10px] !py-[5px] 
              border-2 border-[#e5b300] text-gray-900 dark:text-white 
              text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
              before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full 
              before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear 
              hover:before:h-0 disabled:opacity-60"
          >
            <span className="relative z-10">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevertAndTrashMessage;
