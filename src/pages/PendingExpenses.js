import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { BACKEND_ORIGIN } from "../api";
import "../styles/expense.css";

export default function PendingExpenses() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const employee = JSON.parse(localStorage.getItem("employee"));
  const emp_id = employee?.emp_id;

  useEffect(() => {
    if (!emp_id) return;
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const res = await api.get("/expenses/active", {
        params: { emp_id }
      });
      setRows(res.data || []);
    } catch (e) {
      console.error("Pending expense error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-page">
      <div className="expense-card">
        <div className="expense-header" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/expenses")} className="back-btn">←</button>
          <h3>Pending / Rejected Expenses</h3>
        </div>

        <div className="expense-scroll" style={{ marginTop: 15, maxHeight: "70vh", overflowY: "auto" }}>
          {loading && <p>Loading...</p>}

          {rows.map((r) => (
            <div key={r.id} className="mobile-card">
              <div><b>Date:</b> {new Date(r.expense_date).toLocaleDateString()}</div>
              <div><b>Description:</b> {r.description}</div>
              <div><b>Amount:</b> ₹{r.amount}</div>
              <div><b>Status:</b> {r.status}</div>

              {r.voucher_path && (
                <div style={{ marginTop: 6 }}>
                  <b>File:</b>{" "}
                  {r.voucher_path.split(",").map((path, idx) => (
                    <a
                      key={idx}
                      href={`${BACKEND_ORIGIN}/${path.replace(/^\/+/, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ marginRight: 10, color: "var(--primary)", textDecoration: "underline", fontSize: 14 }}
                    >
                      {path.split("/").pop()}
                    </a>
                  ))}
                </div>
              )}

              {r.status === "pending" && (
                <button
                  style={{
                    marginTop: 8,
                    background: "var(--primary)",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontWeight: 600
                  }}
                  onClick={() => {
                    localStorage.setItem("editExpense", JSON.stringify(r));
                    navigate("/expenses");
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          ))}

          {!loading && rows.length === 0 && <p>No pending requests</p>}
        </div>
      </div>
    </div>
  );
}
