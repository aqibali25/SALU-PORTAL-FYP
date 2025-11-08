import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";
import BackButton from "../BackButton";

const AddDepartment = ({ Title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingDepartment = useMemo(
    () => location.state?.department ?? null,
    [location.state]
  );

  const [form, setForm] = useState({
    departmentName: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        if (editingDepartment) {
          setForm({
            departmentName: editingDepartment.departmentName || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [editingDepartment]);

  const onChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.departmentName.trim()) {
      toast.error("Department name is required");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // Use the upsert endpoint for both add and update
      const payload = editingDepartment
        ? {
            departmentId: editingDepartment.departmentId,
            departmentName: form.departmentName.trim(),
          }
        : {
            departmentName: form.departmentName.trim(),
          };

      console.log("Department Payload:", payload);

      await axios.post(`${API}/api/departments/upsert`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      toast.success(
        editingDepartment
          ? "Department updated successfully!"
          : "Department added successfully!",
        { position: "top-right", autoClose: 2000 }
      );

      setTimeout(() => {
        navigate("/SALU-PORTAL-FYP/Departments");
      }, 1200);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || "Error saving department";
      toast.error(errorMessage, {
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5"
      >
        <div className="flex justify-start items-center gap-3">
          <BackButton
            url={
              Title === "Update Department"
                ? "/SALU-PORTAL-FYP/Departments"
                : "/SALU-PORTAL-FYP/Departments"
            }
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            {Title}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          {/* Department ID - Show only when editing, read-only */}
          {editingDepartment && (
            <InputContainer
              placeholder="Department ID"
              title="Department ID"
              htmlFor="departmentId"
              inputType="text"
              readOnly
              disabled
              width={"40%"}
              justify={"center"}
              value={editingDepartment.departmentId}
            />
          )}

          {/* Department Name */}
          <InputContainer
            placeholder="Enter Department Name"
            title="Department Name"
            htmlFor="departmentName"
            inputType="text"
            required
            value={form.departmentName}
            width={"40%"}
            justify={"center"}
            onChange={onChange("departmentName")}
          />

          {/* Submit Button */}
          <div className="w-full flex justify-center !mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                   before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting
                  ? editingDepartment
                    ? "Updating..."
                    : "Adding..."
                  : editingDepartment
                  ? "Update Department"
                  : "Add Department"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddDepartment;
