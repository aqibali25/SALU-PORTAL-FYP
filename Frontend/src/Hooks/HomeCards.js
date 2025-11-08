import { useState, useEffect } from "react";
import {
  faUserPlus,
  faUsers,
  faComputer,
  faBookOpen,
  faCalendarAlt,
  faPenFancy,
  faCog,
  faBook,
  faMoneyBillWave,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

export const cards = [
  {
    id: 1,
    Heading: "Profile",
    link: "Profile",
    isImg: true,
    color1: "#4F1A60",
    color2: "#f5f5f5",
    roles: ["super admin", "admin", "teacher", "hod"],
  },
  {
    id: 2,
    Heading: "Add User",
    link: "Adduser",
    isImg: false,
    Icon: faUserPlus,
    color1: "#FDDE09",
    color2: "#f5f5f5",
    roles: ["super admin", "admin"],
  },
  {
    id: 3,
    Heading: "List Users",
    link: "ListUsers",
    isImg: false,
    Icon: faUsers,
    color1: "#E40070",
    color2: "#f5f5f5",
    roles: ["super admin", "admin"],
  },
  {
    id: 4,
    Heading: "Admissions",
    link: "Admissions",
    isImg: false,
    Icon: faComputer,
    color1: "#22b508",
    color2: "#f5f5f5",
    roles: ["super admin", "admin", "clerk"],
  },
  {
    id: 5,
    Heading: "Fees",
    link: "Fees",
    isImg: false,
    Icon: faMoneyBillWave,
    color1: "#10B981",
    color2: "#ECFDF5",
    roles: ["super admin", "admin", "clerk"],
  },
  {
    id: 6,
    Heading: "Subject Allocation",
    link: "SubjectAllocation",
    isImg: false,
    Icon: faBookOpen,
    color1: "#CA4DFF",
    color2: "#f5f5f5",
    roles: ["super admin", "hod"],
  },
  {
    id: 7,
    Heading: "Attendance",
    link: "Attendance",
    isImg: false,
    Icon: faCalendarAlt,
    color1: "#007BFF",
    color2: "#f5f5f5",
    roles: ["super admin", "teacher", "hod"],
  },
  {
    id: 8,
    Heading: "Enter Marks",
    link: "EnterMarks",
    isImg: false,
    Icon: faPenFancy,
    color1: "#6A0DAD",
    color2: "#F3E8FF",
    roles: ["super admin", "hod", "teacher"],
  },
  {
    id: 9,
    Heading: "Subjects",
    link: "Subjects",
    isImg: false,
    Icon: faBook,
    color1: "#F97316",
    color2: "#FFF7ED",
    roles: ["super admin", "hod"],
  },
  {
    id: 10,
    Heading: "Departments",
    link: "Departments",
    isImg: false,
    Icon: faBuilding, // You might want to import this icon
    color1: "#8B4513",
    color2: "#F5F5DC",
    roles: ["super admin", "admin"],
  },
  {
    id: 11,
    Heading: "Settings",
    link: "Settings",
    isImg: false,
    Icon: faCog,
    color1: "#09FDEE",
    color2: "#f5f5f5",
    roles: ["super admin", "admin", "teacher", "hod"],
  },
];

export const rolesArray = [
  "Super Admin",
  "Admin",
  "Examination Officer",
  "HOD",
  "Focal Person Admin",
  "Focal Person Teacher",
  "Teacher",
  "Transport Incharge",
  "Librarian",
  "It Support",
  "Clerk",
  "Peon",
];

// Custom hook for departments
export const useDepartments = () => {
  const [departmentsArray, setDepartmentsArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        // Map the department names from the API response
        const apiDepartments = res.data.data.map((item) => item.departmentName);

        // Combine with default departments
        const allDepartments = [...apiDepartments];

        // Remove duplicates and set state
        setDepartmentsArray([...new Set(allDepartments)]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError(error.message);
      // Fallback to default departments if API fails
      setDepartmentsArray([
        "Computer Science",
        "Business Administration",
        "English Linguistics and Literature",
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return { departmentsArray, loading, error, refetch: fetchDepartments };
};

// Default export for departments array (for non-React usage)
export const getDefaultDepartments = () => [
  "Computer Science",
  "Business Administration",
  "English Linguistics and Literature",
];
