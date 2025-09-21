import { useEffect, useMemo, useState } from "react";

/** Search + sort + pagination logic */
export function useUsersTable({ initial = [], pageSize = 8 }) {
  const withIds = useMemo(
    () =>
      initial.map((u, i) => ({
        id: u.id ?? `${u.username}-${u.cnic}-${i}`,
        ...u,
      })),
    [initial]
  );

  const [users, setUsers] = useState(withIds);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "username", dir: "asc" }); // 'username' | 'cnic' | 'role'
  const [page, setPage] = useState(1);

  const norm = (s) => (s ?? "").toString().toLowerCase().trim();

  const filtered = useMemo(() => {
    if (!query) return users;
    const q = norm(query);
    return users.filter((u) =>
      [u.username, u.cnic, u.role].map(norm).some((v) => v.includes(q))
    );
  }, [users, query]);

  const sorted = useMemo(() => {
    const { key, dir } = sort;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = norm(a[key]);
      const bv = norm(b[key]);
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const rows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  // Keep page valid when data size changes (search/sort/delete)
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
    if (page < 1) setPage(1);
  }, [page, pageCount]);

  function onSort(key) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
    setPage(1);
  }

  function deleteUser(user) {
    setUsers((u) => u.filter((x) => x.id !== user.id));
  }

  return {
    rows,
    page,
    pageCount,
    setPage,
    query,
    setQuery,
    sort,
    onSort,
    deleteUser,
  };
}
export const initialUsers = [
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
    role: "Assistant",
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
