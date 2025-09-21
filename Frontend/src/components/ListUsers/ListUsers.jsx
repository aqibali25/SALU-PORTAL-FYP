import { FaEdit, FaTrash } from "react-icons/fa";
import Background from "./../../assets/Background.png";
import Pagination from "../../components/Pagination";
import { useUsersTable } from "../../Hooks/useUsersTable";
import { Link } from "react-router-dom";

/* Sample data */
const initialUsers = [
  {
    username: "Mr. Asif Ali",
    cnic: "45102-1210766-1",
    role: "Office Secretary",
    email: "asif.ali@salu.edu.pk",
  },
  {
    username: "Mr. Taj Muhammad",
    cnic: "45102-1210766-2",
    role: "Assistant",
    email: "taj.muhammad@salu.edu.pk",
  },
  {
    username: "Mr. Asadullah",
    cnic: "45102-1210766-3",
    role: "Assistant", // P.A To PVC → Assistant
    email: "asadullah@salu.edu.pk",
  },
  {
    username: "Mr. Kaleemullah",
    cnic: "45102-1210766-4",
    role: "Clerk",
    email: "kaleemullah@salu.edu.pk",
  },
  {
    username: "Mr. Hafeezullah",
    cnic: "45102-1210766-5",
    role: "Peon",
    email: "hafeezullah@salu.edu.pk",
  },
  {
    username: "Mr. Imran Ali",
    cnic: "45102-1210766-6",
    role: "Peon",
    email: "imran.ali@salu.edu.pk",
  },
  {
    username: "Mr. Abdul Ghaffar",
    cnic: "45102-1210766-7",
    role: "Peon",
    email: "abdul.ghaffar@salu.edu.pk",
  },
  {
    username: "Mr. Asad Ali",
    cnic: "45102-1210766-8",
    role: "Clerk",
    email: "asad.ali@salu.edu.pk",
  },
  {
    username: "Mr. Bilal Ahmed",
    cnic: "42101-9876543-1",
    role: "Supervisor",
    email: "bilal.ahmed@salu.edu.pk",
  },
  {
    username: "Mr. Kamran Khan",
    cnic: "61101-2345678-5",
    role: "Admin",
    email: "kamran.khan@salu.edu.pk",
  },
  {
    username: "Ms. Ayesha Siddiqui",
    cnic: "35201-1122334-8",
    role: "HR Officer",
    email: "ayesha.siddiqui@salu.edu.pk",
  },
  {
    username: "Mr. Fahad Iqbal",
    cnic: "37405-6677889-3",
    role: "Accountant",
    email: "fahad.iqbal@salu.edu.pk",
  },
  {
    username: "Ms. Sana Tariq",
    cnic: "42301-2233445-6",
    role: "IT Support",
    email: "sana.tariq@salu.edu.pk",
  },
  {
    username: "Mr. Waqas Ahmed",
    cnic: "37406-7788990-1",
    role: "Clerk",
    email: "waqas.ahmed@salu.edu.pk",
  },
  {
    username: "Ms. Rabia Noor",
    cnic: "61102-3456789-2",
    role: "Librarian",
    email: "rabia.noor@salu.edu.pk",
  },
  {
    username: "Mr. Zain Ul Abidin",
    cnic: "42102-9988776-4",
    role: "IT Support", // Data Entry Operator → IT Support
    email: "zain.abidin@salu.edu.pk",
  },
  {
    username: "Mr. Naveed Anjum",
    cnic: "35202-5566778-9",
    role: "Assistant", // Security Guard → Assistant
    email: "naveed.anjum@salu.edu.pk",
  },
  {
    username: "Mr. Salman Raza",
    cnic: "61103-7654321-0",
    role: "Assistant", // Driver → Assistant
    email: "salman.raza@salu.edu.pk",
  },
  {
    username: "Ms. Hina Qureshi",
    cnic: "37407-8899001-2",
    role: "Clerk", // Receptionist → Clerk
    email: "hina.qureshi@salu.edu.pk",
  },
  {
    username: "Mr. Umair Javed",
    cnic: "42302-3344556-7",
    role: "Assistant", // Lab Assistant → Assistant
    email: "umair.javed@salu.edu.pk",
  },
  {
    username: "Ms. Mariam Shah",
    cnic: "35203-6677990-5",
    role: "Assistant", // Lecturer → Assistant
    email: "mariam.shah@salu.edu.pk",
  },
  {
    username: "Mr. Danish Ali",
    cnic: "37408-4455667-8",
    role: "Assistant",
    email: "danish.ali@salu.edu.pk",
  },
  {
    username: "Ms. Kiran Fatima",
    cnic: "61104-1122446-3",
    role: "Clerk",
    email: "kiran.fatima@salu.edu.pk",
  },
  {
    username: "Mr. Rashid Mehmood",
    cnic: "42103-5566443-9",
    role: "Peon",
    email: "rashid.mehmood@salu.edu.pk",
  },
  {
    username: "Ms. Iqra Nazeer",
    cnic: "35204-8899112-1",
    role: "Assistant",
    email: "iqra.nazeer@salu.edu.pk",
  },
  {
    username: "Mr. Saqib Akhtar",
    cnic: "61105-2233114-2",
    role: "Peon",
    email: "saqib.akhtar@salu.edu.pk",
  },
  {
    username: "Ms. Mahnoor Ali",
    cnic: "37409-9900112-6",
    role: "Assistant",
    email: "mahnoor.ali@salu.edu.pk",
  },
  {
    username: "Mr. Hamza Yousaf",
    cnic: "42303-7788665-4",
    role: "Clerk",
    email: "hamza.yousaf@salu.edu.pk",
  },
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
        <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-md">
          <table className="min-w-[800px] w-full border-collapse">
            <thead className=" bg-[#D6D6D6] rounded-tl-md rounded-tr-md border-b-2 border-gray-500">
              <tr>
                <th
                  className="!px-6 !py-3 text-left text-lg font-medium tracking-wider cursor-pointer select-none"
                  onClick={() => onSort("username")}
                >
                  <div className="flex items-center gap-2">
                    <span>Username</span>
                    <span className="text-xs">{chevron("username")}</span>
                  </div>
                </th>
                <th
                  className="!px-6 !py-3 text-left text-lg font-medium tracking-wider cursor-pointer select-none"
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
                  className="!px-6 !py-3 text-left text-lg font-medium tracking-wider cursor-pointer select-none"
                  onClick={() => onSort("role")}
                >
                  <div className="flex items-center gap-2">
                    <span>User Role</span>
                    <span className="text-xs">{chevron("role")}</span>
                  </div>
                </th>
                <th className="!px-6 !py-3 text-center text-lg font-medium tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.length > 0 ? (
                rows.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition border-b border-gray-300 dark:border-gray-700"
                  >
                    <td className="!px-6 !py-3 text-md font-medium tracking-wider text-gray-900 dark:text-gray-100">
                      {user.username}
                    </td>
                    <td className="!px-6 !py-3 text-md font-medium tracking-wider text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {user.cnic}
                    </td>
                    <td className="!px-6 !py-3 text-md font-medium tracking-wider text-gray-700 dark:text-gray-300">
                      {user.role}
                    </td>
                    <td className="!px-6 !py-3">
                      <div className="flex justify-center items-center gap-4">
                        <Link
                          to="/Portal.Salu-Gc/UpdateUser"
                          state={{ user }} // 👈 pass the whole user object
                          type="button"
                          className="text-green-600 hover:text-green-700 cursor-pointer"
                        >
                          <FaEdit size={20} />
                        </Link>
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
                <tr>
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
