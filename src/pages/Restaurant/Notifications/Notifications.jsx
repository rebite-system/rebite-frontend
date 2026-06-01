import { useEffect, useState } from "react";
import "./Notifications.css";
import api from "../../../api/axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await api.get("/notifications");
      const notificationsData = res.data.data || res.data || [];

      const formatted = notificationsData.map((n) => {
        const message = n.data?.message || "New update";
        const lowerMessage = message.toLowerCase();

        return {
          id: n.id,
          title: lowerMessage.includes("claim")
            ? "Charity Request"
            : lowerMessage.includes("collected")
            ? "Collection Update"
            : "Listing Update",
          text: message,
          time: new Date(n.created_at).toLocaleString(),
          read: n.read_at ? true : false,
          icon: lowerMessage.includes("claim")
            ? "🤝"
            : lowerMessage.includes("collected")
            ? "✅"
            : "🔔",
        };
      });

      setNotifications(formatted);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  }

  async function markAllNotificationsAsRead() {
    try {
      await api.post("/notifications/read-all");
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAsRead(id) {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  }

  function markAllRead() {
    setNotifications(
      notifications.map((n) => ({ ...n, read: true }))
    );

    markAllNotificationsAsRead();
  }

  return (
    <div className="notifications">
      <div className="notif-header">
        <div>
          <h1 className="notif-title">Notifications</h1>
          <p className="notif-sub">
            Track charity requests, collections, and listing updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {unreadCount > 0 && (
        <div className="unread-banner">
          🔔 You have {unreadCount} unread notification
          {unreadCount > 1 ? "s" : ""}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="notif-empty">
          <div className="notif-empty-icon">📭</div>
          <div className="notif-empty-title">
            No notifications yet
          </div>
          <div className="notif-empty-sub">
            You will be notified when charities request or collect food.
          </div>
        </div>
      ) : (
        <div className="notif-group">
          <div className="group-label">Recent Updates</div>

          <div className="notif-list">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-item ${notif.read ? "read" : "unread"}`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="notif-icon">
                  {notif.icon}
                </div>

                <div className="notif-body">
                  <div className="notif-top">
                    <div className="notif-name">
                      {notif.title}
                    </div>

                    {!notif.read && <div className="notif-dot" />}
                  </div>

                  <div className="notif-text">
                    {notif.text}
                  </div>

                  <div className="notif-time">
                    {notif.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;