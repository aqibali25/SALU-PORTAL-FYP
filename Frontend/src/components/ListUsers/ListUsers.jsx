import { FaEdit, FaTrash } from "react-icons/fa";
import Background from "./../../assets/Background.png";
import Pagination from "../../components/Pagination";
import { useUsersTable } from "../../Hooks/useUsersTable";
/* Sample data */
const initialUsers = [
  {
    username: "Mr. Asif Ali",
    cnic: "45102-1210766-1",
    role: "Office Secretary",
  },
  { username: "Mr. Taj Muhammad", cnic: "45102-1210766-1", role: "Assistant" },
  { username: "Mr. Asadullah", cnic: "45102-1210766-1", role: "P.A To PVC" },
  { username: "Mr. Kaleemullah", cnic: "45102-1210766-1", role: "Clerk" },
  { username: "Mr. Hafeezullah", cnic: "45102-1210766-1", role: "Peon" },
  { username: "Mr. Imran Ali", cnic: "45102-1210766-1", role: "Peon" },
  { username: "Mr. Abdul Ghaffar", cnic: "45102-1210766-1", role: "Peon" },
  { username: "Mr. Asad Ali", cnic: "45102-1210766-1", role: "Clerk" },
  // extra rows
  { username: "Mr. Bilal Ahmed", cnic: "42101-9876543-1", role: "Supervisor" },
  { username: "Mr. Kamran Khan", cnic: "61101-2345678-5", role: "Admin" },
  {
    username: "Ms. Ayesha Siddiqui",
    cnic: "35201-1122334-8",
    role: "HR Officer",
  },
  { username: "Mr. Fahad Iqbal", cnic: "37405-6677889-3", role: "Accountant" },
  { username: "Ms. Sana Tariq", cnic: "42301-2233445-6", role: "IT Support" },
  { username: "Mr. Waqas Ahmed", cnic: "37406-7788990-1", role: "Clerk" },
  { username: "Ms. Rabia Noor", cnic: "61102-3456789-2", role: "Librarian" },
  {
    username: "Mr. Zain Ul Abidin",
    cnic: "42102-9988776-4",
    role: "Data Entry Operator",
  },
  {
    username: "Mr. Naveed Anjum",
    cnic: "35202-5566778-9",
    role: "Security Guard",
  },
  { username: "Mr. Salman Raza", cnic: "61103-7654321-0", role: "Driver" },
  {
    username: "Ms. Hina Qureshi",
    cnic: "37407-8899001-2",
    role: "Receptionist",
  },
  {
    username: "Mr. Umair Javed",
    cnic: "42302-3344556-7",
    role: "Lab Assistant",
  },
  { username: "Ms. Mariam Shah", cnic: "35203-6677990-5", role: "Lecturer" },
  { username: "Mr. Danish Ali", cnic: "37408-4455667-8", role: "Assistant" },
  { username: "Ms. Kiran Fatima", cnic: "61104-1122446-3", role: "Clerk" },
  { username: "Mr. Rashid Mehmood", cnic: "42103-5566443-9", role: "Peon" },
  { username: "Ms. Iqra Nazeer", cnic: "35204-8899112-1", role: "Assistant" },
  { username: "Mr. Saqib Akhtar", cnic: "61105-2233114-2", role: "Peon" },
  { username: "Ms. Mahnoor Ali", cnic: "37409-9900112-6", role: "Assistant" },
  { username: "Mr. Hamza Yousaf", cnic: "42303-7788665-4", role: "Clerk" },
  { username: "Mr. Bilal Ahmed", cnic: "42101-9876543-1", role: "Supervisor" },
  { username: "Mr. Kamran Khan", cnic: "61101-2345678-5", role: "Admin" },
  {
    username: "Ms. Ayesha Siddiqui",
    cnic: "35201-1122334-8",
    role: "HR Officer",
  },
  { username: "Mr. Fahad Iqbal", cnic: "37405-6677889-3", role: "Accountant" },
  { username: "Ms. Sana Tariq", cnic: "42301-2233445-6", role: "IT Support" },
  { username: "Mr. Waqas Ahmed", cnic: "37406-7788990-1", role: "Clerk" },
  { username: "Ms. Rabia Noor", cnic: "61102-3456789-2", role: "Librarian" },
  {
    username: "Mr. Zain Ul Abidin",
    cnic: "42102-9988776-4",
    role: "Data Entry Operator",
  },
  {
    username: "Mr. Naveed Anjum",
    cnic: "35202-5566778-9",
    role: "Security Guard",
  },
  { username: "Mr. Salman Raza", cnic: "61103-7654321-0", role: "Driver" },
  {
    username: "Ms. Hina Qureshi",
    cnic: "37407-8899001-2",
    role: "Receptionist",
  },
  {
    username: "Mr. Umair Javed",
    cnic: "42302-3344556-7",
    role: "Lab Assistant",
  },
  { username: "Ms. Mariam Shah", cnic: "35203-6677990-5", role: "Lecturer" },
  { username: "Mr. Danish Ali", cnic: "37408-4455667-8", role: "Assistant" },
  { username: "Ms. Kiran Fatima", cnic: "61104-1122446-3", role: "Clerk" },
  { username: "Mr. Rashid Mehmood", cnic: "42103-5566443-9", role: "Peon" },
  { username: "Ms. Iqra Nazeer", cnic: "35204-8899112-1", role: "Assistant" },
  { username: "Mr. Saqib Akhtar", cnic: "61105-2233114-2", role: "Peon" },
  { username: "Ms. Mahnoor Ali", cnic: "37409-9900112-6", role: "Assistant" },
  { username: "Mr. Hamza Yousaf", cnic: "42303-7788665-4", role: "Clerk" },
  { username: "Mr. Bilal Ahmed", cnic: "42101-9876543-1", role: "Supervisor" },
  { username: "Mr. Kamran Khan", cnic: "61101-2345678-5", role: "Admin" },
  {
    username: "Ms. Ayesha Siddiqui",
    cnic: "35201-1122334-8",
    role: "HR Officer",
  },
  { username: "Mr. Fahad Iqbal", cnic: "37405-6677889-3", role: "Accountant" },
  { username: "Ms. Sana Tariq", cnic: "42301-2233445-6", role: "IT Support" },
  { username: "Mr. Waqas Ahmed", cnic: "37406-7788990-1", role: "Clerk" },
  { username: "Ms. Rabia Noor", cnic: "61102-3456789-2", role: "Librarian" },
  {
    username: "Mr. Zain Ul Abidin",
    cnic: "42102-9988776-4",
    role: "Data Entry Operator",
  },
  {
    username: "Mr. Naveed Anjum",
    cnic: "35202-5566778-9",
    role: "Security Guard",
  },
  { username: "Mr. Salman Raza", cnic: "61103-7654321-0", role: "Driver" },
  {
    username: "Ms. Hina Qureshi",
    cnic: "37407-8899001-2",
    role: "Receptionist",
  },
  {
    username: "Mr. Umair Javed",
    cnic: "42302-3344556-7",
    role: "Lab Assistant",
  },
  { username: "Ms. Mariam Shah", cnic: "35203-6677990-5", role: "Lecturer" },
  { username: "Mr. Danish Ali", cnic: "37408-4455667-8", role: "Assistant" },
  { username: "Ms. Kiran Fatima", cnic: "61104-1122446-3", role: "Clerk" },
  { username: "Mr. Rashid Mehmood", cnic: "42103-5566443-9", role: "Peon" },
  { username: "Ms. Iqra Nazeer", cnic: "35204-8899112-1", role: "Assistant" },
  { username: "Mr. Saqib Akhtar", cnic: "61105-2233114-2", role: "Peon" },
  { username: "Ms. Mahnoor Ali", cnic: "37409-9900112-6", role: "Assistant" },
  { username: "Mr. Hamza Yousaf", cnic: "42303-7788665-4", role: "Clerk" },
  { username: "Mr. Bilal Ahmed", cnic: "42101-9876543-1", role: "Supervisor" },
  { username: "Mr. Kamran Khan", cnic: "61101-2345678-5", role: "Admin" },
  {
    username: "Ms. Ayesha Siddiqui",
    cnic: "35201-1122334-8",
    role: "HR Officer",
  },
  { username: "Mr. Fahad Iqbal", cnic: "37405-6677889-3", role: "Accountant" },
  { username: "Ms. Sana Tariq", cnic: "42301-2233445-6", role: "IT Support" },
  { username: "Mr. Waqas Ahmed", cnic: "37406-7788990-1", role: "Clerk" },
  { username: "Ms. Rabia Noor", cnic: "61102-3456789-2", role: "Librarian" },
  {
    username: "Mr. Zain Ul Abidin",
    cnic: "42102-9988776-4",
    role: "Data Entry Operator",
  },
  {
    username: "Mr. Naveed Anjum",
    cnic: "35202-5566778-9",
    role: "Security Guard",
  },
  { username: "Mr. Salman Raza", cnic: "61103-7654321-0", role: "Driver" },
  {
    username: "Ms. Hina Qureshi",
    cnic: "37407-8899001-2",
    role: "Receptionist",
  },
  {
    username: "Mr. Umair Javed",
    cnic: "42302-3344556-7",
    role: "Lab Assistant",
  },
  { username: "Ms. Mariam Shah", cnic: "35203-6677990-5", role: "Lecturer" },
  { username: "Mr. Danish Ali", cnic: "37408-4455667-8", role: "Assistant" },
  { username: "Ms. Kiran Fatima", cnic: "61104-1122446-3", role: "Clerk" },
  { username: "Mr. Rashid Mehmood", cnic: "42103-5566443-9", role: "Peon" },
  { username: "Ms. Iqra Nazeer", cnic: "35204-8899112-1", role: "Assistant" },
  { username: "Mr. Saqib Akhtar", cnic: "61105-2233114-2", role: "Peon" },
  { username: "Ms. Mahnoor Ali", cnic: "37409-9900112-6", role: "Assistant" },
  { username: "Mr. Hamza Yousaf", cnic: "42303-7788665-4", role: "Clerk" },
];

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
  } = useUsersTable({ initial: initialUsers, pageSize: 8 });

  const chevron = (key) =>
    sort.key === key ? (sort.dir === "asc" ? "▲" : "▼") : "";
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
        <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
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
        <div className="flex flex-col justify-start items-center min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto">
          <table className="min-w-[800px] w-full">
            <thead className="flex justify-center items-center w-full h-8 bg-[#D6D6D6] rounded-tl-md rounded-tr-md border-b-2 border-gray-500">
              <tr className="flex justify-start !p-10 items-center w-full text-gray-900">
                <th
                  className="px-6 py-3 text-left text-lg font-medium tracking-wider w-[25%] cursor-pointer select-none"
                  onClick={() => onSort("username")}
                >
                  <div className="flex items-center gap-2">
                    <span>Username</span>
                    <span className="text-xs">{chevron("username")}</span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-lg font-medium tracking-wider w-[25%] cursor-pointer select-none"
                  onClick={() => onSort("cnic")}
                >
                  <div className="flex items-center gap-2">
                    <span>User CNIC</span>
                    <span className="text-xs whitespace-nowrap">
                      {chevron("cnic")}
                    </span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-lg font-medium tracking-wider w-[25%] cursor-pointer select-none"
                  onClick={() => onSort("role")}
                >
                  <div className="flex items-center gap-2">
                    <span>User Role</span>
                    <span className="text-xs">{chevron("role")}</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-lg font-medium tracking-wider w-[25%]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="flex flex-col justify-center items-center w-full">
              {rows.length > 0 ? (
                rows.map((user) => (
                  <tr
                    key={user.id}
                    className="flex justify-start !p-3 !px-10 items-center w-full border-b border-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition hover:bg-gray-100 "
                  >
                    <td className="px-6 py-3 text-left text-md font-medium tracking-wider w-[25%] text-gray-900 dark:text-gray-100">
                      {user.username}
                    </td>
                    <td className="px-6 py-3 text-left text-md font-medium tracking-wider w-[25%] text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {user.cnic}
                    </td>
                    <td className="px-6 py-3 text-left text-md font-medium tracking-wider w-[25%] text-gray-700 dark:text-gray-300">
                      {user.role}
                    </td>
                    <td className="w-[25%]">
                      <div className="flex justify-center items-center gap-4">
                        <button
                          type="button"
                          className="text-green-600 hover:text-green-700 cursor-pointer"
                          onClick={() => alert(`Edit ${user.username}`)}
                          aria-label={`Edit ${user.username}`}
                        >
                          <FaEdit size={20} />
                        </button>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-600 cursor-pointer"
                          onClick={() => deleteUser(user)}
                          aria-label={`Remove ${user.username}`}
                        >
                          <FaTrash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="flex justify-center items-center w-full">
                  <td
                    colSpan={4}
                    className="text-center text-gray-900 text-2xl dark:text-gray-100 py-6"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="w-full py-4">
          <Pagination
            totalPages={pageCount}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            siblingCount={2}
            boundaryCount={1}
          />
        </div>
      </div>
    </div>
  );
}
