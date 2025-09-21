// Hooks/useRecivedForm.js
import { useState, useMemo } from "react";

export default function useRecivedForm({ initial = [], pageSize = 10 }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: "", dir: "asc" });

  // Filter + sort
  const filtered = useMemo(() => {
    let data = [...initial];
    if (query) {
      data = data.filter((item) =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    }
    if (sort.key) {
      data.sort((a, b) => {
        if (a[sort.key] < b[sort.key]) return sort.dir === "asc" ? -1 : 1;
        if (a[sort.key] > b[sort.key]) return sort.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [initial, query, sort]);

  const pageCount = Math.ceil(filtered.length / pageSize) || 1;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const onSort = (key) =>
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));

  return { rows, page, pageCount, setPage, query, setQuery, sort, onSort };
}

export const initialForms = [
  {
    serialNo: 1,
    studentName: "Aqib Ali",
    fatherName: "Muhammad Sadique",
    department: "Computer Science",
    cnic: "42101-1234567-1",
  },
  {
    serialNo: 2,
    studentName: "Muhammad Sahil",
    fatherName: "Hizbullah",
    department: "Business Administration",
    cnic: "42101-2345678-2",
  },
  {
    serialNo: 3,
    studentName: "Muhammad Faizan",
    fatherName: "Muhammad Akram",
    department: "English Language and Literature",
    cnic: "42101-3456789-3",
  },
  {
    serialNo: 4,
    studentName: "Abdul Basit",
    fatherName: "Abdul Qadir",
    department: "Computer Science",
    cnic: "42101-9876543-5",
  },
  {
    serialNo: 5,
    studentName: "Ali Raza",
    fatherName: "Zafar Iqbal",
    department: "Business Administration",
    cnic: "42101-4567890-4",
  },
  {
    serialNo: 6,
    studentName: "Hassan Khan",
    fatherName: "Nasir Khan",
    department: "Computer Science",
    cnic: "42101-5678901-5",
  },
  {
    serialNo: 7,
    studentName: "Bilal Ahmed",
    fatherName: "Tariq Ahmed",
    department: "English Language and Literature",
    cnic: "42101-6789012-6",
  },
  {
    serialNo: 8,
    studentName: "Usman Ghani",
    fatherName: "Saeed Ghani",
    department: "Business Administration",
    cnic: "42101-7890123-7",
  },
  {
    serialNo: 9,
    studentName: "Hamza Yousuf",
    fatherName: "Yousuf Ali",
    department: "Computer Science",
    cnic: "42101-8901234-8",
  },
  {
    serialNo: 10,
    studentName: "Saad Salman",
    fatherName: "Salman Akram",
    department: "English Language and Literature",
    cnic: "42101-9012345-9",
  },
  {
    serialNo: 11,
    studentName: "Noman Ali",
    fatherName: "Ali Gohar",
    department: "Computer Science",
    cnic: "42101-0123456-0",
  },
  {
    serialNo: 12,
    studentName: "Shahzaib Khan",
    fatherName: "Aziz Khan",
    department: "Business Administration",
    cnic: "42101-1123456-1",
  },
  {
    serialNo: 13,
    studentName: "Rehan Ahmed",
    fatherName: "Imtiaz Ahmed",
    department: "English Language and Literature",
    cnic: "42101-1223456-2",
  },
  {
    serialNo: 14,
    studentName: "Asad Jamal",
    fatherName: "Jamal Uddin",
    department: "Computer Science",
    cnic: "42101-1323456-3",
  },
  {
    serialNo: 15,
    studentName: "Fahad Zubair",
    fatherName: "Zubair Khan",
    department: "Business Administration",
    cnic: "42101-1423456-4",
  },
  {
    serialNo: 16,
    studentName: "Ibrahim Ali",
    fatherName: "Shahid Ali",
    department: "Computer Science",
    cnic: "42101-1523456-5",
  },
  {
    serialNo: 17,
    studentName: "Kashif Mehmood",
    fatherName: "Mehmood Akhtar",
    department: "English Language and Literature",
    cnic: "42101-1623456-6",
  },
  {
    serialNo: 18,
    studentName: "Zeeshan Anwar",
    fatherName: "Anwar Hussain",
    department: "Business Administration",
    cnic: "42101-1723456-7",
  },
  {
    serialNo: 19,
    studentName: "Rizwan Tariq",
    fatherName: "Tariq Mehmood",
    department: "Computer Science",
    cnic: "42101-1823456-8",
  },
  {
    serialNo: 20,
    studentName: "Farhan Aziz",
    fatherName: "Aziz Ullah",
    department: "English Language and Literature",
    cnic: "42101-1923456-9",
  },
  {
    serialNo: 21,
    studentName: "Salman Qureshi",
    fatherName: "Qamar Qureshi",
    department: "Computer Science",
    cnic: "42101-2023456-0",
  },
  {
    serialNo: 22,
    studentName: "Owais Raza",
    fatherName: "Raza Hussain",
    department: "Business Administration",
    cnic: "42101-2123456-1",
  },
  {
    serialNo: 23,
    studentName: "Waleed Khan",
    fatherName: "Arif Khan",
    department: "English Language and Literature",
    cnic: "42101-2223456-2",
  },
  {
    serialNo: 24,
    studentName: "Imran Asif",
    fatherName: "Asif Bhatti",
    department: "Computer Science",
    cnic: "42101-2323456-3",
  },
  {
    serialNo: 25,
    studentName: "Danish Ali",
    fatherName: "Ali Sher",
    department: "Business Administration",
    cnic: "42101-2423456-4",
  },
  {
    serialNo: 26,
    studentName: "Junaid Iqbal",
    fatherName: "Iqbal Khan",
    department: "English Language and Literature",
    cnic: "42101-2523456-5",
  },
  {
    serialNo: 27,
    studentName: "Shahid Hussain",
    fatherName: "Hussain Shah",
    department: "Computer Science",
    cnic: "42101-2623456-6",
  },
  {
    serialNo: 28,
    studentName: "Amir Nawaz",
    fatherName: "Nawaz Sharif",
    department: "Business Administration",
    cnic: "42101-2723456-7",
  },
  {
    serialNo: 29,
    studentName: "Yasir Ahmed",
    fatherName: "Ahmed Siddiqi",
    department: "English Language and Literature",
    cnic: "42101-2823456-8",
  },
  {
    serialNo: 30,
    studentName: "Kamran Khan",
    fatherName: "Khan Muhammad",
    department: "Computer Science",
    cnic: "42101-2923456-9",
  },
  {
    serialNo: 31,
    studentName: "Zohaib Ali",
    fatherName: "Ali Jan",
    department: "Business Administration",
    cnic: "42101-3023456-0",
  },
  {
    serialNo: 32,
    studentName: "Sarfaraz Anjum",
    fatherName: "Anjum Rasheed",
    department: "English Language and Literature",
    cnic: "42101-3123456-1",
  },
  {
    serialNo: 33,
    studentName: "Furqan Shah",
    fatherName: "Shah Nawaz",
    department: "Computer Science",
    cnic: "42101-3223456-2",
  },
  {
    serialNo: 34,
    studentName: "Talha Nadeem",
    fatherName: "Nadeem Akhtar",
    department: "Business Administration",
    cnic: "42101-3323456-3",
  },
  {
    serialNo: 35,
    studentName: "Muneeb Abbas",
    fatherName: "Abbas Ali",
    department: "English Language and Literature",
    cnic: "42101-3423456-4",
  },
  {
    serialNo: 36,
    studentName: "Shabbir Ali",
    fatherName: "Ali Sheraz",
    department: "Computer Science",
    cnic: "42101-3523456-5",
  },
  {
    serialNo: 37,
    studentName: "Hammad Rauf",
    fatherName: "Rauf Ahmed",
    department: "Business Administration",
    cnic: "42101-3623456-6",
  },
  {
    serialNo: 38,
    studentName: "Adnan Tariq",
    fatherName: "Tariq Masood",
    department: "English Language and Literature",
    cnic: "42101-3723456-7",
  },
  {
    serialNo: 39,
    studentName: "Qasim Shah",
    fatherName: "Shahbaz Khan",
    department: "Computer Science",
    cnic: "42101-3823456-8",
  },
  {
    serialNo: 40,
    studentName: "Huzaifa Ahmed",
    fatherName: "Ahmed Yousuf",
    department: "Business Administration",
    cnic: "42101-3923456-9",
  },
  {
    serialNo: 41,
    studentName: "Saif Ullah",
    fatherName: "Ullah Khan",
    department: "English Language and Literature",
    cnic: "42101-4023456-0",
  },
  {
    serialNo: 42,
    studentName: "Tahir Mehmood",
    fatherName: "Mehmood Aslam",
    department: "Computer Science",
    cnic: "42101-4123456-1",
  },
  {
    serialNo: 43,
    studentName: "Adeel Raza",
    fatherName: "Raza Qamar",
    department: "Business Administration",
    cnic: "42101-4223456-2",
  },
  {
    serialNo: 44,
    studentName: "Naveed Arif",
    fatherName: "Arif Qureshi",
    department: "English Language and Literature",
    cnic: "42101-4323456-3",
  },
  {
    serialNo: 45,
    studentName: "Imtiaz Hussain",
    fatherName: "Hussain Shahid",
    department: "Computer Science",
    cnic: "42101-4423456-4",
  },
  {
    serialNo: 46,
    studentName: "Ehsan Khan",
    fatherName: "Khan Sheraz",
    department: "Business Administration",
    cnic: "42101-4523456-5",
  },
  {
    serialNo: 47,
    studentName: "Shahbaz Ali",
    fatherName: "Ali Haider",
    department: "English Language and Literature",
    cnic: "42101-4623456-6",
  },
  {
    serialNo: 48,
    studentName: "Rashid Mahmood",
    fatherName: "Mahmood Iqbal",
    department: "Computer Science",
    cnic: "42101-4723456-7",
  },
  {
    serialNo: 49,
    studentName: "Kaleem Ullah",
    fatherName: "Ullah Shah",
    department: "Business Administration",
    cnic: "42101-4823456-8",
  },
  {
    serialNo: 50,
    studentName: "Ammar Javed",
    fatherName: "Javed Akhtar",
    department: "English Language and Literature",
    cnic: "42101-4923456-9",
  },
];
