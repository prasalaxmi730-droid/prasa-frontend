import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function TicketSystem() {
  const navigate = useNavigate();
  const employee = JSON.parse(localStorage.getItem("employee"));
  const emp_id = employee?.emp_id;

  const [employees, setEmployees] = useState([]);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    ticket_date: "",
    assigned_to: "",
    task: ""
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!emp_id) {
      navigate("/login");
      return;
    }

    loadEmployees();

    const raw = localStorage.getItem("editTicket");
    if (raw) {
      const t = JSON.parse(raw);

      setEditId(t.id);
      setForm({
        ticket_date: t.ticket_date.split("T")[0],
        assigned_to: t.assigned_to || "",
        task: t.description || ""
      });

      localStorage.removeItem("editTicket");
    }
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/auth/employees", {
        params: { exclude: emp_id }
      });
      setEmployees(res.data || []);
    } catch {
      setEmployees([]);
    }
  };

  const saveTicket = async () => {
    try {
      const fd = new FormData();
      fd.append("ticket_date", form.ticket_date);
      fd.append("assigned_to", form.assigned_to);
      fd.append("description", form.task);
      files.forEach(f => fd.append("attachments", f));

      if (editId) {
        // 🔥 FIX: UPDATE must use multipart/form-data (multer backend)
        await api.put(`/ticket-system/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        alert("Ticket updated");
        navigate("/tickets/pending");
      } else {
        // ➕ NEW
        fd.append("emp_id", emp_id);

        await api.post("/ticket-system", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Ticket saved");
      }

      setForm({ ticket_date: "", assigned_to: "", task: "" });
      setFiles([]);
      setEditId(null);
    } catch (err) {
      console.error("TICKET SAVE ERROR:", err);
      alert("Failed to save ticket");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button
            style={styles.backBtn}
            onClick={() =>
              navigate(editId ? "/tickets/pending" : "/profile")
            }
          >
            ←
          </button>
          <h3 style={styles.headerTitle}>Ticket System</h3>
        </div>

        <div style={styles.tabs}>
          <button style={styles.activeTab}>Ticket System</button>
          <button style={styles.tab} onClick={() => navigate("/tickets/pending")}>
            Pending Requests
          </button>
        </div>

        <input
          type="date"
          value={form.ticket_date}
          onChange={e => setForm({ ...form, ticket_date: e.target.value })}
          style={styles.input}
        />

        <select
          value={form.assigned_to}
          onChange={e => setForm({ ...form, assigned_to: e.target.value })}
          style={styles.input}
        >
          <option value="">Assign To</option>
          {employees.map(emp => (
            <option key={emp.emp_id} value={emp.emp_id}>
              {emp.emp_name} ({emp.emp_id})
            </option>
          ))}
        </select>

        <textarea
          placeholder="Task"
          value={form.task}
          onChange={e => setForm({ ...form, task: e.target.value })}
          style={styles.textarea}
        />

        <input
          type="file"
          multiple
          style={styles.fileInput}
          onChange={e => setFiles([...e.target.files])}
        />

        <button style={styles.primaryBtn} onClick={saveTicket}>
          {editId ? "Update Ticket" : "Save Ticket"}
        </button>
      </div>
    </div>
  );
}

/* UI unchanged */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, var(--bg-start), var(--bg-end))",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: 28,
    paddingBottom: 20
  },
  card: {
    background: "var(--surface)",
    width: "92%",
    maxWidth: 420,
    borderRadius: 16,
    padding: 18,
    boxSizing: "border-box",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)"
  },
  header: { display: "flex", alignItems: "center", marginBottom: 10 },
  backBtn: { background: "none", border: "none", fontSize: 22, marginRight: 10, cursor: "pointer", color: "var(--primary)" },
  headerTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text)" },
  tabs: { display: "flex", gap: 10, marginBottom: 15 },
  activeTab: { flex: 1, background: "var(--primary)", color: "#fff", border: "none", padding: 10, borderRadius: 10, fontWeight: 600 },
  tab: { flex: 1, background: "#e9eef4", color: "#334155", border: "none", padding: 10, borderRadius: 10, fontWeight: 600 },
  input: { width: "100%", padding: 12, marginBottom: 12, borderRadius: 10, border: "1px solid var(--border)", background: "#f8fbff" },
  textarea: { width: "100%", padding: 12, height: 90, borderRadius: 10, border: "1px solid var(--border)", marginBottom: 12, background: "#f8fbff" },
  fileInput: { marginBottom: 12 },
  primaryBtn: { width: "100%", background: "var(--primary)", color: "#fff", padding: 14, borderRadius: 12, border: "none", fontWeight: 600 }
};
