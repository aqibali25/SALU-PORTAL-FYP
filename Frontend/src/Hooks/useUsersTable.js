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
