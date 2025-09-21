// pages/ListUsers.jsx
import { FaEdit, FaTrash } from "react-icons/fa";
import DataTable from "../TableData";
import Pagination from "../../components/Pagination";
import { useUsersTable, initialUsers } from "../../Hooks/useUsersTable";
import Background from "./../../assets/Background.png";
import { useNavigate } from "react-router-dom";

export default function ListUsers() {
  const {
    rows,
    page,
    pageCount,
    setPage,
    query,
    setQuery,
    sort,
    onSort,
    deleteUser,
  } = useUsersTable({ initial: initialUsers, pageSize: 10 });

  const navigate = useNavigate(); // 👈 hook

  const columns = [
    { key: "username", label: "Username" },
    { key: "cnic", label: "User CNIC" },
    { key: "role", label: "User Role" },
  ];

  const actions = [
    {
      label: "Edit",
      onClick: (row) => {
        // 👇 navigate with CNIC in the URL and full object in state
        navigate(`/SALU-PORTAL-FYP/UpdateUser?${row.cnic}`, {
          state: { user: row },
        });
      },
      icon: (
        <FaEdit size={20} className="text-green-600 hover:text-green-700" />
      ),
      className: "cursor-pointer",
    },
    {
      label: "Delete",
      onClick: (row) => deleteUser(row),
      icon: <FaTrash size={20} className="text-red-500 hover:text-red-600" />,
      className: "cursor-pointer",
    },
  ];

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
        <h1 className="text-2xl sm:text-3xl md:text!-4xl !py-3 font-bold text-gray-900 dark:text-white">
          Users List
        </h1>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Search */}
        <div className="w-full flex justify-end">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search users..."
            className="
            !px-2 !py-1
            border-2 border-[#a5a5a5] outline-none
            bg-[#f9f9f9] text-[#2a2a2a]
            dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
            disabled:opacity-60 disabled:cursor-not-allowed
            "
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          rows={rows}
          sort={sort}
          onSort={onSort}
          actions={actions}
        />

        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Users : {initialUsers.length}
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
