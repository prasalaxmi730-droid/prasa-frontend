import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function Expenses() {
  const navigate = useNavigate();
  const employee = JSON.parse(localStorage.getItem("employee"));

  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [files, setFiles] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("editExpense");
    if (raw) {
      const exp = JSON.parse(raw);
      setEditId(exp.id);
      setDate(exp.expense_date.split("T")[0]);
      setDesc(exp.description);
      setAmount(exp.amount);
      localStorage.removeItem("editExpense");
    }
  }, []);

  const saveExpense = async () => {
    try {
      const fd = new FormData();
      fd.append("emp_id", employee.emp_id);
      fd.append("expense_date", date);
      fd.append("description", desc);
      fd.append("amount", amount);

      // ✅ SAME KEY AS TICKET SYSTEM
      files.forEach(f => fd.append("attachments", f));

      if (editId) {
        // ✅ UPDATE (multipart enforced)
        await api.put(`/expenses/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        navigate("/expenses/pending");
      } else {
        // ✅ CREATE (multipart enforced)
        await api.post("/expenses", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      setDate("");
      setDesc("");
      setAmount("");
      setFiles([]);
      setEditId(null);

    } catch (err) {
      console.error("EXPENSE SAVE ERROR:", err);
      alert("Expense save/update failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span
            style={styles.backArrow}
            onClick={() => navigate(editId ? "/expenses/pending" : "/profile")}
          >
            ←
          </span>
          <span style={styles.title}>Expenses</span>
        </div>

        <div style={styles.tabs}>
          <button style={styles.activeTab}>Expenses</button>
          <button
            style={styles.tab}
            onClick={() => navigate("/expenses/pending")}
          >
            Pending Requests
          </button>
        </div>

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="Description"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          style={styles.textarea}
        />

        <input
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={styles.input}
        />

        <input
          type="file"
          multiple
          onChange={e => setFiles([...e.target.files])}
          style={{ marginBottom: 12 }}
        />

        <button style={styles.primaryBtn} onClick={saveExpense}>
          {editId ? "Update Expense" : "Save Expense"}
        </button>
      </div>
    </div>
  );
}

/* UI untouched */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, var(--bg-start), var(--bg-end))",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: 28
  },
  card: {
    background: "var(--surface)",
    width: "92%",
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)"
  },
  header: { display: "flex", alignItems: "center", marginBottom: 15, gap: 10 },
  backArrow: { fontSize: 22, cursor: "pointer", color: "var(--primary)" },
  title: { fontSize: 20, fontWeight: "bold", color: "var(--text)" },
  tabs: { display: "flex", gap: 10, marginBottom: 15 },
  activeTab: { flex: 1, background: "var(--primary)", color: "#fff", border: "none", padding: 10, borderRadius: 10, fontWeight: 600 },
  tab: { flex: 1, background: "#e9eef4", color: "#334155", border: "none", padding: 10, borderRadius: 10, fontWeight: 600 },
  input: { width: "100%", padding: 12, marginBottom: 12, borderRadius: 10, border: "1px solid var(--border)", background: "#f8fbff" },
  textarea: { width: "100%", padding: 12, height: 90, borderRadius: 10, border: "1px solid var(--border)", marginBottom: 12, background: "#f8fbff" },
  primaryBtn: { width: "100%", background: "var(--primary)", color: "#fff", padding: 14, borderRadius: 12, border: "none", fontSize: 16, fontWeight: 600 }
};
