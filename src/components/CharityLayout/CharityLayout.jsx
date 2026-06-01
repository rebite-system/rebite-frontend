import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FiHome,
  FiPackage,
  FiUser,
  FiBell,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import "./CharityLayout.css";
import api from "../../api/axios";

function CharityLayout({ children }) {

const [collapsed, setCollapsed] = useState(true);

  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("user"));

  useEffect(() => {

    fetchNotifications();

  }, []);

  async function fetchNotifications() {

    try {

      const res =
        await api.get("/notifications");

      const notifications =
        res.data.data || res.data || [];

      const unread =
        notifications.filter(
          (n) => !n.read_at
        ).length;

      setUnreadCount(unread);

    } catch (err) {

      console.log(err.response?.data);

    }
  }

  function handleLogout() {

    localStorage.removeItem("token");

    localStorage.removeItem("role");

    localStorage.removeItem("user");

    navigate("/signin");
  }

  return (

    <div className="charity-layout">

      <aside
        className={`charity-sidebar ${
          collapsed ? "collapsed" : ""
        }`}
      >

        <div className="charity-sidebar-top">

          {!collapsed ? (

            <div className="charity-sidebar-logo">

              <div className="charity-logo-circle">
                🌿
              </div>

              <span className="charity-sidebar-logo-txt">
                ReBite
              </span>

            </div>

          ) : (

            <div className="charity-logo-circle">
              🌿
            </div>

          )}

          <button
            className="charity-collapse-btn"
            onClick={() =>
              setCollapsed(!collapsed)
            }
          >

            {collapsed ? (
              <FiChevronRight />
            ) : (
              <FiChevronLeft />
            )}

          </button>

        </div>

        {!collapsed ? (

          <div className="charity-sidebar-info">

            <div className="charity-sidebar-avatar">

              {user?.name
                ?.slice(0, 2)
                .toUpperCase()}

            </div>

            <div>

              <div className="charity-sidebar-name">
                {user?.name}
              </div>

              <div className="charity-sidebar-loc">
                📍 Charity
              </div>

            </div>

          </div>

        ) : (

          <div className="charity-avatar-only">

            {user?.name
              ?.slice(0, 2)
              .toUpperCase()}

          </div>

        )}

        <nav className="charity-sidebar-nav">

          <NavLink
            to="/charity"
            end
            className={({ isActive }) =>
              isActive
                ? "charity-nav-item active"
                : "charity-nav-item"
            }
          >

            <FiHome className="charity-nav-icon" />

            {!collapsed && (

              <span className="charity-nav-txt">
                Available Food
              </span>

            )}

          </NavLink>

          <NavLink
            to="/charity/claimed"
            className={({ isActive }) =>
              isActive
                ? "charity-nav-item active"
                : "charity-nav-item"
            }
          >

            <FiPackage className="charity-nav-icon" />

            {!collapsed && (

              <span className="charity-nav-txt">
                Claimed Listings
              </span>

            )}

          </NavLink>

        </nav>

        <div className="charity-sidebar-bottom">

          <NavLink
            to="/charity/profile"
            className={({ isActive }) =>
              isActive
                ? "charity-nav-item active"
                : "charity-nav-item"
            }
          >

            <FiUser className="charity-nav-icon" />

            {!collapsed && (

              <span className="charity-nav-txt">
                Profile
              </span>

            )}

          </NavLink>

          <NavLink
            to="/charity/notifications"
            className={({ isActive }) =>
              isActive
                ? "charity-nav-item active"
                : "charity-nav-item"
            }
          >

            <div className="charity-notif-wrapper">

              <FiBell className="charity-nav-icon" />

              {unreadCount > 0 && (

                <span className="charity-nav-badge">
                  {unreadCount}
                </span>

              )}

            </div>

            {!collapsed && (

              <span className="charity-nav-txt">
                Notifications
              </span>

            )}

          </NavLink>

          <div
            className="charity-nav-item logout"
            onClick={handleLogout}
          >

            <FiLogOut className="charity-nav-icon" />

            {!collapsed && (

              <span className="charity-nav-txt">
                Logout
              </span>

            )}

          </div>

        </div>

      </aside>

      <main
        className={`charity-main ${
          collapsed ? "collapsed" : ""
        }`}
      >
        {children}
      </main>

    </div>

  );
}

export default CharityLayout;