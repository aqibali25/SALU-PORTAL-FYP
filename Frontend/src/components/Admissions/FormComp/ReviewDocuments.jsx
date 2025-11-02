import React, { useState } from "react";
import { FaEye, FaRegFileAlt } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import ApprovedMessage from "../ApprovedMessage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ReviewDocuments = () => {
  const location = useLocation();
  const formData = location.state?.form?.data;
  const documents = formData?.uploaded_documents || [];

  const [previewImage, setPreviewImage] = useState(null);
  const [showApproved, setShowApproved] = useState(false);

  // Preview document
  const handlePreview = (fileName) => {
    const backendBaseUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    setPreviewImage(`${backendBaseUrl}/uploads/${fileName}`);
  };

  const closePreview = () => setPreviewImage(null);

  // Approve form function
  const handleApprove = async () => {
    setShowApproved(false); // close modal first
    if (!formData?.form_id) {
      toast.error("Form ID missing, cannot approve.", {
        position: "top-center",
      });
      return;
    }

    const backendBaseUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    try {
      await axios.patch(
        `${backendBaseUrl}/api/admissions/updateStatus/${formData.form_id}`,
        {
          status: "Approved",
        }
      );
      toast.success("Form approved successfully!", { position: "top-center" });
    } catch (err) {
      console.error("Error updating form status:", err);
      toast.error("Failed to approve form", { position: "top-center" });
    }
  };

  if (!documents.length) {
    return (
      <p className="text-center text-gray-700 dark:text-gray-200 mt-10">
        No uploaded documents found.
      </p>
    );
  }

  return (
    <div className="w-full mx-auto !px-4 !py-6">
      <ToastContainer />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="border-collapse w-full min-w-[550px] md:min-w-[800px]">
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
                key={doc.id}
                className="border-t border-gray-300 dark:border-gray-600"
              >
                <td className="!p-4 flex items-center gap-3 text-gray-800 dark:text-gray-100">
                  <FaRegFileAlt className="text-2xl text-gray-700 dark:text-gray-200" />
                  {doc.docName || "Untitled Document"}
                </td>
                <td className="!p-4 text-gray-600 dark:text-gray-300 text-sm">
                  {new Date(doc.uploadDate).toLocaleDateString()}
                </td>
                <td className="!p-4 text-right">
                  <FaEye
                    className="text-2xl text-gray-700 dark:text-gray-200 cursor-pointer hover:text-green-600 transition-colors inline-block"
                    title="View Document"
                    onClick={() => handlePreview(doc.fileName)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 cursor-pointer"
          onClick={closePreview}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-w-[90%] max-h-[90%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain cursor-auto"
            />
          </div>
        </div>
      )}

      {/* Approved message modal */}
      {showApproved && (
        <ApprovedMessage
          open={showApproved}
          onClose={handleApprove}
          onCancel={() => setShowApproved(false)}
        />
      )}
    </div>
  );
};

export default ReviewDocuments;
