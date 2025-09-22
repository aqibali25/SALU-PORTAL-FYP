// pages/FormsByStatus.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../TableData";
import Pagination from "../Pagination";
import Background from "./../../assets/Background.png";
import { initialForms } from "../../Hooks/useRecivedForms";
import useRecivedForm from "../../Hooks/useRecivedForms";
import BackButton from "../BackButton";

function FormsByStatus({ status = "" }) {
  const navigate = useNavigate();

  // 🟢 Filter based on status prop
  const filteredForms =
    !status || status.trim() === ""
      ? initialForms
      : initialForms.filter((form) => form.status === status);

  // 👇 page size based on filteredForms
  const pageSize =
    !filteredForms || filteredForms.length === 0
      ? 0
      : filteredForms.length <= 10
      ? filteredForms.length
      : 10;

  const { rows, page, pageCount, setPage, query, setQuery, sort, onSort } =
    useRecivedForm({
      initial: filteredForms, // 👈 pass filtered forms here
      pageSize,
    });

  // Build columns; include status column only if status prop is empty (means showing all forms)
  const columns = [
    { key: "serialNo", label: "Serial No." },
    { key: "studentName", label: "Student's Name" },
    { key: "fatherName", label: "Father's Name" },
    { key: "department", label: "Department" },
    { key: "cnic", label: "CNIC" },
    // only show Status column if we are listing all forms (status prop empty)
    status !== "" && status && { key: "status", label: "Status" },
  ];

  // Always show default “View” action
  const actions = [
    {
      label: "View",
      onClick: (row) => {
        localStorage.removeItem("reviewFormStep");
        navigate(
          `/SALU-PORTAL-FYP/Admissions/RecivedForms/ReviewForm?${row.cnic}`,
          {
            state: { form: row },
          }
        );
      },
      icon: (
        <button className="!px-4 !py-1 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition cursor-pointer">
          View
        </button>
      ),
      className: "cursor-pointer",
    },
  ];

  // 🟢 Dynamic heading
  const heading = `${
    status && status.trim() !== "" ? status : "Received"
  } Forms`;

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
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl md:text!-4xl !py-3 font-bold text-gray-900 dark:text-white">
            {heading}
          </h1>
        </div>
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Search */}
        <div className="w-full max-w-[100%]] flex justify-end overflow-hidden">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search users..."
            className="
            max-w-[100%]
            !px-2 !py-1
            border-2 border-[#a5a5a5] outline-none
            bg-[#f9f9f9] text-[#2a2a2a]
            dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
            disabled:opacity-60 disabled:cursor-not-allowed
            "
          />
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          sort={sort}
          onSort={onSort}
          actions={status === "" && !status && actions} // always pass built-in action
        />

        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Forms : {filteredForms.length}
          </span>
          <Pagination
            totalPages={pageCount}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
export default FormsByStatus;
