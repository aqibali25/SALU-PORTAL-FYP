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
  faBuilding,
  faUserGraduate,
  faBookReader,
  faDollarSign,
  faCalendarCheck,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

export const cards = [
  {
    id: 1,
    Heading: "Profile",
    link: "Profile",
    isImg: true,
    color1: "#4F1A60",
    color2: "#F5F3F7",
    roles: ["super admin", "admin", "teacher", "hod", "student"],
  },
  {
    id: 2,
    Heading: "Add User",
    link: "Adduser",
    isImg: false,
    Icon: faUserPlus,
    color1: "#FACC15",
    color2: "#FEF9C3",
    roles: ["super admin", "admin"],
  },
  {
    id: 3,
    Heading: "List Users",
    link: "ListUsers",
    isImg: false,
    Icon: faUsers,
    color1: "#E11D48",
    color2: "#FEE2E2",
    roles: ["super admin", "admin"],
  },
  {
    id: 4,
    Heading: "Enrolled Students",
    link: "EnrolledStudents",
    isImg: false,
    Icon: faUserGraduate,
    color1: "#059669",
    color2: "#ECFDF5",
    roles: ["super admin", "admin", "hod"],
  },
  {
    id: 5,
    Heading: "Admission Schedule",
    link: "AdmissionSchedule",
    isImg: false,
    Icon: faCalendarCheck,
    color1: "#7C3AED",
    color2: "#F3E8FF",
    roles: ["super admin", "admin"],
  },
  {
    id: 6,
    Heading: "Admissions",
    link: "Admissions",
    isImg: false,
    Icon: faComputer,
    color1: "#0EA5E9",
    color2: "#E0F2FE",
    roles: ["super admin", "admin", "clerk"],
  },
  {
    id: 7,
    Heading: "Time Table",
    link: "TimeTable",
    isImg: false,
    Icon: faClock,
    color1: "#7C3AED",
    color2: "#F3E8FF",
    roles: ["super admin", "hod", "student"],
  },
  {
    id: 8,
    Heading: "Fees",
    link: "Fees",
    isImg: false,
    Icon: faDollarSign,
    color1: "#10B981",
    color2: "#D1FAE5",
    roles: ["super admin", "admin", "clerk"],
  },
  {
    id: 9,
    Heading: "Subject Allocation",
    link: "SubjectAllocation",
    isImg: false,
    Icon: faBookOpen,
    color1: "#9333EA",
    color2: "#FAF5FF",
    roles: ["super admin", "hod"],
  },
  {
    id: 10,
    Heading: "Attendance",
    link: "Attendance",
    isImg: false,
    Icon: faCalendarAlt,
    color1: "#2563EB",
    color2: "#EFF6FF",
    roles: ["super admin", "teacher", "hod"],
  },
  {
    id: 11,
    Heading: "Enter Marks",
    link: "EnterMarks",
    isImg: false,
    Icon: faPenFancy,
    color1: "#6D28D9",
    color2: "#EDE9FE",
    roles: ["super admin", "hod", "teacher"],
  },
  {
    id: 12,
    Heading: "Subjects",
    link: "Subjects",
    isImg: false,
    Icon: faBook,
    color1: "#F97316",
    color2: "#FFF7ED",
    roles: ["super admin", "hod", "teacher", "student"],
  },
  {
    id: 13,
    Heading: "Departments",
    link: "Departments",
    isImg: false,
    Icon: faBuilding,
    color1: "#8B4513",
    color2: "#F5EDE0",
    roles: ["super admin", "admin"],
  },
  {
    id: 14,
    Heading: "Library",
    link: "Library",
    isImg: false,
    Icon: faBookReader,
    color1: "#1E3A8A",
    color2: "#E0E7FF",
    roles: ["super admin", "librarian", "student"],
  },
  {
    id: 15,
    Heading: "Settings",
    link: "Settings",
    isImg: false,
    Icon: faCog,
    color1: "#6B7280",
    color2: "#F3F4F6",
    roles: ["super admin", "admin", "teacher", "hod", "student"],
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
  "Student",
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
