import { HiOutlineBell } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { FaEnvelope, FaEnvelopeOpen } from "react-icons/fa";

// Mock notification data - replace with actual API calls
const mockNotifications = [
  {
    id: 1,
    title: "Admission Schedule Updated",
    message: "The admission schedule for Spring 2024 has been updated",
    time: "2 hours ago",
    read: false,
    type: "info",
  },
  {
    id: 2,
    title: "Fee Submission Reminder",
    message: "Last date for fee submission is approaching",
    time: "1 day ago",
    read: false,
    type: "warning",
  },
  {
    id: 3,
    title: "Class Schedule",
    message: "Your class schedule for next week is available",
    time: "2 days ago",
    read: true,
    type: "success",
  },
  {
    id: 4,
    title: "System Maintenance",
    message: "System maintenance scheduled for Sunday 2:00 AM - 6:00 AM",
    time: "3 days ago",
    read: true,
    type: "info",
  },
];

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAsUnread = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: false } : notification
      )
    );
  };

  const toggleReadStatus = (id, currentStatus) => {
    if (currentStatus) {
      markAsUnread(id);
    } else {
      markAsRead(id);
    }
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const getEnvelopeIcon = (isRead) => {
    return isRead ? (
      <FaEnvelopeOpen className="h-4 w-4 text-gray-400" />
    ) : (
      <FaEnvelope className="h-4 w-4 text-blue-500" />
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative grid h-8 w-8 place-items-center rounded-full
          bg-white text-gray-900 ring-1 ring-black/10 md:ring-white/40
          transition hover:ring-black/20 md:hover:ring-white/60
          shrink-0 group cursor-pointer"
        aria-label="Notifications"
      >
        <HiOutlineBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full
              bg-red-500 text-xs font-medium text-white
              ring-1 ring-white dark:ring-gray-800"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute top-[50px] left-[-170px] w-[90vw] max-w-[320px] 
            sm:max-w-[320px] sm:w-80
            bg-[#f5f5f5] dark:bg-gray-800 shadow-lg 
            transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700 ${
              isOpen
                ? "opacity-100 translate-y-0 visible"
                : "opacity-0 -translate-y-3 invisible"
            }`}
        >
          {/* Dropdown arrow - Responsive position */}
          <div
            className="absolute top-[-10px] right-[123px] 
            sm:right-[123px] max-[375px]:right-[100px]
            w-[20px] h-[20px] bg-[#f5f5f5] dark:bg-gray-800 rotate-45 z-1 border-t border-l border-gray-200 dark:border-gray-700"
          />

          {/* Header */}
          <div
            className="flex items-center justify-between !p-4
              border-b border-gray-200 dark:border-gray-700
              bg-gray-50 dark:bg-gray-900 z-10 "
          >
            <h3 className="font-semibold text-gray-900 dark:text-white !m-0">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400
                  hover:text-blue-800 dark:hover:text-blue-300
                  transition-colors duration-200 !m-0"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto !m-0">
            {notifications.length === 0 ? (
              <div className="!p-4 text-center text-gray-500 dark:text-gray-400 !m-0">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`!p-3 border-b border-gray-200 dark:border-gray-700
                    transition-colors duration-200 !m-0
                    ${
                      !notification.read
                        ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                >
                  <div className="flex items-start gap-3 !m-0">
                    {/* Envelope icon for read/unread with toggle functionality */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReadStatus(notification.id, notification.read);
                      }}
                      className="flex-shrink-0 !m-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title={
                        notification.read ? "Mark as unread" : "Mark as read"
                      }
                    >
                      {getEnvelopeIcon(notification.read)}
                    </button>

                    <div
                      className="flex-1 min-w-0 !m-0 cursor-pointer"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0 !m-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1">
                          <h4
                            className={`font-medium text-sm !mb-1 !mt-0
                              ${
                                !notification.read
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                          >
                            {notification.title}
                          </h4>
                          <p
                            className="text-xs text-gray-600 dark:text-gray-400 !mb-1 !mt-0
                              line-clamp-2"
                          >
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-500 !m-0">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!notification.read && (
                      <div
                        className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 !mt-2"
                        title="Unread"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className="!p-3 border-t border-gray-200 dark:border-gray-700
              bg-gray-50 dark:bg-gray-900 rounded-b-md !m-0"
          >
            <Link
              to="/SALU-PORTAL-FYP/notifications"
              className="block text-center text-sm text-blue-600 dark:text-blue-400
                hover:text-blue-800 dark:hover:text-blue-300
                transition-colors duration-200 font-medium !m-0"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
