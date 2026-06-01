import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FiHome,
  FiPlusSquare,
  FiMenu,
  FiUser,
  FiBell,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
} from "react-icons/fi";

import "./RestaurantLayout.css";
import api from "../../api/axios";

function RestaurantLayout({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await api.get("/notifications");
      const notifications = res.data.data || res.data || [];

      const unread = notifications.filter((n) => !n.read_at).length;

      setUnreadCount(unread);
    } catch (err) {
      console.log(err.response?.data);
    }
  }

  function getInitials(name) {
    if (!name) return "RB";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/signin");
  }

  return (
    <div className="rest-layout">
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div>
          <div className="sidebar-top">
            {!collapsed ? (
              <div className="sidebar-logo">
                <div className="logo-circle">🌿</div>

                <span className="sidebar-logo-txt">
                  ReBite 
                </span>
              </div>
            ) : (
              <div className="logo-circle">🌿</div>
            )}

            <button
              className="collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>

          {!collapsed ? (
            <div className="sidebar-restaurant">
              <div className="sidebar-avatar">
                {getInitials(user?.name)}
              </div>

              <div>
                <div className="sidebar-rest-name">
                  {user?.name || "Restaurant"}
                </div>

                <div className="sidebar-rest-loc">
                  Restaurant Partner
                </div>
              </div>
            </div>
          ) : (
            <div className="sidebar-avatar-only">
              {getInitials(user?.name)}
            </div>
          )}

          <nav className="sidebar-nav">
            <NavLink
              to="/restaurant"
              end
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <FiHome className="nav-icon" />

              {!collapsed && <span className="nav-txt">Dashboard</span>}
            </NavLink>

            <NavLink
              to="/restaurant/add-listing"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <FiPlusSquare className="nav-icon" />

              {!collapsed && <span className="nav-txt">Add Listing</span>}
            </NavLink>

            <NavLink
              to="/restaurant/manage-listings"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <FiMenu className="nav-icon" />

              {!collapsed && (
                <span className="nav-txt">Manage Listings</span>
              )}
            </NavLink>

            <NavLink
              to="/restaurant/claims"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <FiClipboard className="nav-icon" />

              {!collapsed && (
                <span className="nav-txt">Charity Requests</span>
              )}
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <NavLink
            to="/restaurant/notifications"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <div className="notification-wrapper">
              <FiBell className="nav-icon" />

              {unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </div>

            {!collapsed && (
              <span className="nav-txt">Notifications</span>
            )}
          </NavLink>

          <NavLink
            to="/restaurant/profile"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <FiUser className="nav-icon" />

            {!collapsed && <span className="nav-txt">Profile</span>}
          </NavLink>

          <div className="nav-item logout-item" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />

            {!collapsed && <span className="nav-txt">Logout</span>}
          </div>
        </div>
      </aside>

      <main className={`rest-main ${collapsed ? "collapsed" : ""}`}>
        {children}
      </main>
    </div>
  );
}

export default RestaurantLayout;