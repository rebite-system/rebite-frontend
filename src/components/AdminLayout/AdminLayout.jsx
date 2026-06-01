import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
    FiGrid,
    FiUsers,
    FiClipboard,
    FiPackage,
    FiTrash2,
    FiSettings,
    FiFileText,
    FiLogOut,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";

import "./AdminLayout.css";

function AdminLayout({ children }) {

    const [collapsed, setCollapsed] = useState(true);

    const navigate = useNavigate();

    // ================= USER =================
    const user = JSON.parse(localStorage.getItem("user"));

    // ================= LOGOUT =================
    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/signin");
    };

    return (

        <div className="admin-layout">

            {/* ================= SIDEBAR ================= */}

            <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>

                {/* ================= TOP ================= */}

                <div className="admin-sidebar-top">

                    {!collapsed ? (

                        <div className="admin-sidebar-logo">

                            <div className="admin-logo-circle">
                                🌿
                            </div>

                            <span className="admin-sidebar-logo-txt">
                                ReBite
                            </span>

                        </div>

                    ) : (

                        <div className="admin-logo-circle">
                            🌿
                        </div>

                    )}

                    <button
                        className="admin-collapse-btn"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed
                            ? <FiChevronRight />
                            : <FiChevronLeft />}
                    </button>

                </div>

                {/* ================= ADMIN INFO ================= */}

                {!collapsed ? (

                    <div
                        className="admin-sidebar-info"
                        onClick={() => navigate("/admin/profile")}
                        style={{ cursor: "pointer" }}
                    >

                        {/* Avatar */}

                        <div className="admin-sidebar-avatar">

                            {user?.name
                                ? user.name
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()
                                : "AD"}

                        </div>

                        {/* Name + Role */}

                        <div>

                            <div className="admin-sidebar-name">
                                {user?.name || "Admin"}
                            </div>

                            <div className="admin-sidebar-role">
                                {user?.role || "Super Admin"}
                            </div>

                        </div>

                    </div>

                ) : (

                    <div className="admin-avatar-only">

                        {user?.name
                            ? user.name
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "AD"}

                    </div>

                )}

                {/* ================= NAVIGATION ================= */}

                <nav className="admin-sidebar-nav">

                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-item active"
                                : "admin-nav-item"
                        }
                    >
                        <FiGrid className="admin-nav-icon" />

                        {!collapsed && (
                            <span className="admin-nav-txt">
                                Dashboard
                            </span>
                        )}

                    </NavLink>

                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-item active"
                                : "admin-nav-item"
                        }
                    >
                        <FiUsers className="admin-nav-icon" />

                        {!collapsed && (
                            <span className="admin-nav-txt">
                                Users Management
                            </span>
                        )}

                    </NavLink>

                    <NavLink
                        to="/admin/requests"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-item active"
                                : "admin-nav-item"
                        }
                    >
                        <FiClipboard className="admin-nav-icon" />

                        {!collapsed && (
                            <span className="admin-nav-txt">
                                Registration Requests
                            </span>
                        )}

                    </NavLink>

                    <NavLink
                        to="/admin/donations"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-item active"
                                : "admin-nav-item"
                        }
                    >
                        <FiPackage className="admin-nav-icon" />

                        {!collapsed && (
                            <span className="admin-nav-txt">
                                Donations Monitoring
                            </span>
                        )}

                    </NavLink>

                    <NavLink
                        to="/admin/food-waste"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-item active"
                                : "admin-nav-item"
                        }
                    >
                        <FiTrash2 className="admin-nav-icon" />

                        {!collapsed && (
                            <span className="admin-nav-txt">
                                Food Waste 
                            </span>
                        )}

                    </NavLink>

                    <NavLink
                        to="/admin/settings"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-item active"
                                : "admin-nav-item"
                        }
                    >
                        <FiSettings className="admin-nav-icon" />

                        {!collapsed && (
                            <span className="admin-nav-txt">
                                System Settings
                            </span>
                        )}

                    </NavLink>

                    <NavLink
                        to="/admin/reports"
                        className={({ isActive }) =>
                            isActive
                                ? "admin-nav-item active"
                                : "admin-nav-item"
                        }
                    >
                        <FiFileText className="admin-nav-icon" />

                        {!collapsed && (
                            <span className="admin-nav-txt">
                                Reports
                            </span>
                        )}

                    </NavLink>

                </nav>

                {/* ================= LOGOUT ================= */}

                <div className="admin-sidebar-bottom">

                    <button
                        type="button"
                        className="admin-nav-item logout admin-logout-btn"
                        onClick={handleLogout}
                    >

                        <FiLogOut className="admin-nav-icon" />

                        {!collapsed && (
                            <span className="admin-nav-txt">
                                Logout
                            </span>
                        )}

                    </button>

                </div>

            </aside>

            {/* ================= MAIN ================= */}

            <main className={`admin-main ${collapsed ? "collapsed" : ""}`}>

                {children}

            </main>

        </div>
    );
}

export default AdminLayout;

