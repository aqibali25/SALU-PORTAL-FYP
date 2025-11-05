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

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'image', 'pdf', 'document'
  const [showApproved, setShowApproved] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Preview document - similar to your working component
  const handlePreview = async (doc) => {
    try {
      setLoadingPreview(true);
      const backendBaseUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

      // Check if it's an image
      const isImage =
        doc.mimeType?.startsWith("image/") ||
        doc.fileName?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);

      // Check if it's PDF
      const isPDF =
        doc.mimeType === "application/pdf" || doc.fileName?.match(/\.pdf$/i);

      if (isImage) {
        // For images, create a blob URL
        const response = await axios.get(
          `${backendBaseUrl}/api/admissions/viewDocument/${doc.id}`,
          {
            responseType: "blob",
            headers: {
              Accept: doc.mimeType || "image/*",
            },
          }
        );
        const blobUrl = URL.createObjectURL(response.data);
        setPreviewUrl(blobUrl);
        setPreviewType("image");
      } else if (isPDF) {
        // For PDFs, create blob URL and open in new tab
        const response = await axios.get(
          `${backendBaseUrl}/api/admissions/viewDocument/${doc.id}`,
          {
            responseType: "blob",
            headers: {
              Accept: "application/pdf",
            },
          }
        );
        const blobUrl = URL.createObjectURL(response.data);
        window.open(blobUrl, "_blank");
        setLoadingPreview(false);
        return;
      } else {
        // For other documents, download or open in new tab
        const response = await axios.get(
          `${backendBaseUrl}/api/admissions/viewDocument/${doc.id}`,
          {
            responseType: "blob",
            headers: {
              Accept: doc.mimeType || "application/octet-stream",
            },
          }
        );
        const blobUrl = URL.createObjectURL(response.data);
        window.open(blobUrl, "_blank");
        setLoadingPreview(false);
        return;
      }
    } catch (error) {
      console.error("Error previewing document:", error);
      toast.error("Error previewing document. Please try again.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
    // Clean up blob URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Approve form function
  const handleApprove = async () => {
    setShowApproved(false);
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
      {/* Loading overlay for preview */}
      {loadingPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 cursor-pointe">
          <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
        </div>
      )}
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
                  <FaRegFileAlt className="text-3xl text-gray-700 dark:text-gray-200" />
                  <div>
                    <div>{doc.docName || "Untitled Document"}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      • {doc.mimeType}
                    </div>
                  </div>
                </td>
                <td className="!p-4 text-gray-600 dark:text-gray-300 text-sm">
                  {new Date(doc.uploadDate).toLocaleDateString()}
                </td>
                <td className="!p-4 text-right">
                  <button
                    onClick={() => handlePreview(doc)}
                    disabled={loadingPreview}
                    className="text-gray-700 dark:text-gray-200 hover:text-green-600 transition-colors disabled:opacity-50"
                    title="View Document"
                  >
                    <FaEye className="text-2xl cursor-pointer" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image preview modal - Only for images */}
      {previewUrl && previewType === "image" && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 cursor-pointer"
          onClick={closePreview}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-w-[90%] max-h-[90%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewUrl}
              alt="Document Preview"
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
