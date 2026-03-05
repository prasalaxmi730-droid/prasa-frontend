import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/expense.css";

export default function PendingTickets() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("employee");
    if (stored) setEmployee(JSON.parse(stored));
  }, []);

  const loadPending = useCallback(async () => {
    if (!employee) return;

    try {
      const res = await api.get(`/ticket-system/pending/${employee.emp_id}`);
      setRows(res.data || []);
    } catch (err) {
      console.log("pending ticket error", err);
    } finally {
      setLoading(false);
    }
  }, [employee]);

  useEffect(() => {
    if (!employee) return;
    loadPending();
  }, [employee, loadPending]);

  const openEdit = (row) => {
    localStorage.setItem("editTicket", JSON.stringify(row));
    navigate("/ticket-system");
  };

  return (
    <div className="expense-page">
      <div
        className="expense-card"
        style={{
          marginTop: 20,
          maxHeight: "calc(100vh - 40px)",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid #ddd" }}>
          <button className="back-btn" onClick={() => navigate("/ticket-system")}>
            {"<-"}
          </button>
          <h3 style={{ flex: 1, textAlign: "center" }}>Pending Tickets</h3>
          <div style={{ width: 30 }}></div>
        </div>

        <div className="mobile-list" style={{ marginTop: 10, overflowY: "auto", flex: 1 }}>
          {loading && <p>Loading...</p>}

          {rows.map((r) => (
            <div key={r.id} className="mobile-card">
              <div><b>Date:</b> {r.ticket_date}</div>
              <div><b>Assigned To:</b> {r.assigned_to}</div>
              <div><b>Description:</b> {r.description}</div>
              <div><b>Status:</b> {r.status}</div>

              {r.status === "pending" && (
                <button
                  onClick={() => openEdit(r)}
                  style={{
                    marginTop: 8,
                    backgroundColor: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          ))}

          {!loading && rows.length === 0 && (
            <p style={{ textAlign: "center" }}>No pending tickets</p>
          )}
        </div>
      </div>
    </div>
  );
}
