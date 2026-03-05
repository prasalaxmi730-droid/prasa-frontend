import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminPendingRequests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("expenses");
  const [expenses, setExpenses] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (!admin || !admin.admin_id) {
      navigate("/");
      return;
    }
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/expenses/pending");
      const sorted = (res.data || []).sort((a, b) =>
        (a.emp_id || "").localeCompare(b.emp_id || "")
      );
      setExpenses(sorted);
      setActiveTab("expenses");
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/tickets/pending");
      const sorted = (res.data || []).sort((a, b) =>
        (a.emp_id || "").localeCompare(b.emp_id || "")
      );
      setTickets(sorted);
      setActiveTab("tickets");
    } finally {
      setLoading(false);
    }
  };

  const approveExpense = async (id) => {
    await api.put(`/admin/expenses/${id}/approve`);
    loadExpenses();
  };

  const rejectExpense = async (id) => {
    await api.put(`/admin/expenses/${id}/reject`);
    loadExpenses();
  };

  const approveTicket = async (id) => {
    await api.put(`/admin/tickets/${id}/approve`);
    loadTickets();
  };

  const rejectTicket = async (id) => {
    await api.put(`/admin/tickets/${id}/reject`);
    loadTickets();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button style={styles.back} onClick={() => navigate("/admin-dashboard")}>
            <-
          </button>
          <h2 style={styles.title}>Pending Requests</h2>
        </div>

        <div style={styles.tabs}>
          <button
            style={activeTab === "expenses" ? styles.activeTab : styles.tab}
            onClick={loadExpenses}
          >
            Expenses
          </button>
          <button
            style={activeTab === "tickets" ? styles.activeTab : styles.tab}
            onClick={loadTickets}
          >
            Ticket System
          </button>
        </div>

        <div style={styles.listContainer}>
          {!loading &&
            activeTab === "expenses" &&
            expenses.map((e) => (
              <div key={e.id} style={styles.item}>
                <p><b>Employee:</b> {e.emp_id}</p>
                <p><b>Date:</b> {e.expense_date}</p>
                <p><b>Amount:</b> Rs {e.amount}</p>
                <p><b>Description:</b> {e.description}</p>
                <button style={styles.actionBtn} onClick={() => approveExpense(e.id)}>Approve</button>
                <button style={styles.rejectBtn} onClick={() => rejectExpense(e.id)}>Reject</button>
              </div>
            ))}

          {!loading &&
            activeTab === "tickets" &&
            tickets.map((t) => (
              <div key={t.id} style={styles.item}>
                <p><b>Employee:</b> {t.emp_id}</p>
                <p><b>Status:</b> {t.status}</p>
                <p><b>Description:</b> {t.description}</p>
                <button style={styles.actionBtn} onClick={() => approveTicket(t.id)}>Approve</button>
                <button style={styles.rejectBtn} onClick={() => rejectTicket(t.id)}>Reject</button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(#2f855a,#b7e4c7)",
    display: "flex",
    justifyContent: "center",
    paddingTop: 40
  },
  card: {
    background: "#fff",
    width: "92%",
    maxWidth: 420,
    borderRadius: 18,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    height: "85vh"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
  },
  back: {
    background: "none",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    color: "#2f855a"
  },
  title: {
    margin: 0,
    fontSize: 22
  },
  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 15
  },
  tab: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#e5e5e5"
  },
  activeTab: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#2f855a",
    color: "#fff"
  },
  listContainer: {
    flex: 1,
    overflowY: "auto",
    paddingRight: 6
  },
  item: {
    background: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 14
  },
  actionBtn: {
    marginRight: 8,
    border: "none",
    background: "#2f855a",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer"
  },
  rejectBtn: {
    border: "none",
    background: "#c53030",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer"
  }
};
