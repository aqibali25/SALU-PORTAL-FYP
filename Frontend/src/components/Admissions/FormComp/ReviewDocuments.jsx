import React, { useState } from "react";
import { FaEye, FaRegFileAlt } from "react-icons/fa";
import Background from "../../../assets/background.png";
import Logo from "../../../assets/Logo.png";
import Profile from "../../../assets/Profile.png";

// your messages
import ApprovedMessage from "../ApprovedMessage";
// import RevertMessage from "../RevertMessage";
// import TrashMessage from "../TrashMessage";

const ReviewDocuments = () => {
  const documents = [
    {
      docType: "photo",
      docName: "Passport Size Photos",
      file: Profile,
      updatedDate: "07 May 2025",
    },
    {
      docType: "cnic",
      docName: "CNIC/B-Form",
      file: Background,
      updatedDate: "11 May 2025",
    },
    {
      docType: "marks12",
      docName: "12th Mark Sheet",
      file: Logo,
      updatedDate: "07 May 2025",
    },
    {
      docType: "marks10",
      docName: "10th Mark Sheet",
      file: Logo,
      updatedDate: "07 May 2025",
    },
    {
      docType: "domicile",
      docName: "Domicile (For Bachelors)",
      file: Logo,
      updatedDate: "10 May 2025",
    },
  ];

  const [previewImage, setPreviewImage] = useState(null);
  const handlePreview = (fileUrl) => setPreviewImage(fileUrl);
  const closePreview = () => setPreviewImage(null);

  // 👇 state for showing messages
  const [activeMessage, setActiveMessage] = useState(null);
  const closeMessage = () => setActiveMessage(null);

  return (
    <div className="w-full mx-auto !px-4 !py-6">
      {/* table wrapper */}
      <div className="overflow-x-auto">
        <table
          className="
            border-collapse 
            w-full
            min-w-[550px] 
            md:min-w-[800px]
          "
        >
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="text-left !p-4 text-gray-800 dark:text-gray-100 font-semibold w-1/2">
                Document Name
              </th>
              <th className="text-left !p-4 text-gray-800 dark:text-gray-100 font-semibold w-1/3">
                Last Updated Date
              </th>
              <th className="text-right !p-4 text-gray-800 dark:text-gray-100 font-semibold w-1/6">
                View
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.docType}
                className="border-t border-gray-300 dark:border-gray-600"
              >
                <td className="!p-4 flex items-center gap-3 text-gray-800 dark:text-gray-100">
                  <FaRegFileAlt className="text-2xl text-gray-700 dark:text-gray-200" />
                  {doc.docName}
                </td>
                <td className="!p-4 text-gray-600 dark:text-gray-300 text-sm">
                  {doc.updatedDate}
                </td>
                <td className="!p-4 text-right">
                  <FaEye
                    className="text-2xl text-gray-700 dark:text-gray-200 cursor-pointer hover:text-green-600 transition-colors inline-block"
                    title="View Document"
                    onClick={() => handlePreview(doc.file)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* image preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 cursor-pointer"
          onClick={closePreview}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-w-[90%] max-h-[90%] p-4"
            onClick={(e) => e.stopPropagation()} // prevent close on inner click
          >
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain cursor-auto"
            />
          </div>
        </div>
      )}

      {/* message modals */}
      {activeMessage === "approved" && (
        <ApprovedMessage onClose={closeMessage} />
      )}
      {activeMessage === "revert" && <RevertMessage onClose={closeMessage} />}
      {activeMessage === "trash" && <TrashMessage onClose={closeMessage} />}
    </div>
  );
};

export default ReviewDocuments;
