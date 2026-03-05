import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { BACKEND_ORIGIN } from "../api";
import "../styles/expense.css";

// URL builder (UNCHANGED)
const getPdfUrl = (file) => {
  if (!file) return "";
  if (file.startsWith("http")) return file;
  if (file.startsWith("uploads/")) return `${BACKEND_ORIGIN}/${file}`;
  return `${BACKEND_ORIGIN}/uploads/${file}`;
};

export default function History() {
  const navigate = useNavigate();
  const employee = JSON.parse(localStorage.getItem("employee"));
  const emp_id = employee?.emp_id;

  const [type, setType] = useState("expenses");
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [previewPdf, setPreviewPdf] = useState(null);

  useEffect(() => {
    if (!emp_id) {
      navigate("/login");
      return;
    }
    fetchHistory();
    // eslint-disable-next-line
  }, [type]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // ✅ BILLS FETCH (APPROVED FILES ONLY)
      if (type === "bills") {
        const res = await api.get("/history/bills");
        setData(res.data || []);
        setLoading(false); // 🔥 FIX: stop loading for Bills
        return;
      }

      // EXISTING LOGIC (UNCHANGED)
      const params = { emp_id };
      if (filter.from) params.from = filter.from;
      if (filter.to) params.to = filter.to;

      const res = await api.get(`/history/${type}`, { params });

      const normalized = (res.data || []).map(r => ({
        ...r,
        voucher_files: r.voucher_path
          ? r.voucher_path.split(",").map(f => f.trim())
          : r.attachment_paths
            ? r.attachment_paths.split(",").map(f => f.trim())
            : []
      }));

      setData(normalized);
    } catch (err) {
      console.error("History error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, var(--bg-start), var(--bg-end))", paddingTop: 12 }}>
      <div className="expense-page" style={{ display: "flex", justifyContent: "center" }}>
        <div className="expense-card" style={{ width: "100%", maxWidth: 420, marginTop: 8 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => navigate("/profile")}
              style={{
                background: "#edf3fa",
                color: "var(--primary)",
                borderRadius: 10,
                width: 36,
                height: 36,
                border: "none",
                fontSize: 18
              }}
            >
              ←
            </button>
            <h2>History</h2>
          </div>

          {/* Tabs */}
          <div className="expense-tabs">
            <button
              className={type === "expenses" ? "tab-active" : "tab-inactive"}
              onClick={() => setType("expenses")}
            >
              Expenses
            </button>
            <button
              className={type === "bills" ? "tab-active" : "tab-inactive"}
              onClick={() => setType("bills")}
            >
              Bills
            </button>
            <button
              className={type === "ticket-system" ? "tab-active" : "tab-inactive"}
              onClick={() => setType("ticket-system")}
            >
              Ticket System
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              type="date"
              value={filter.from}
              onChange={(e) => setFilter({ ...filter, from: e.target.value })}
            />
            <input
              type="date"
              value={filter.to}
              onChange={(e) => setFilter({ ...filter, to: e.target.value })}
            />
            <button className="primary-btn" onClick={fetchHistory}>
              Apply
            </button>
          </div>

          {loading && <p>Loading…</p>}

          {/* ================= BILLS SECTION ================= */}
          <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
            {type === "bills" &&
              data.length > 0 &&
              data[0].voucher_files &&
              data[0].voucher_files.length > 0 &&
              data[0].voucher_files.map((file, i) => (
                <div key={i} className="mobile-card" style={{ marginBottom: 12 }}>
                  <div
                    onClick={() => setPreviewPdf(getPdfUrl(file))}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: 12,
                      border: "1px solid #ccc",
                      borderRadius: 8,
                      background: "#f7f7f7",
                      cursor: "pointer"
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 60,
                        background: "var(--primary)",
                        color: "#fff",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 6
                      }}
                    >
                      PDF
                    </div>
                    <div style={{ wordBreak: "break-all" }}>
                      {file.split("/").pop()}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <a href={getPdfUrl(file)} download className="secondary-btn">
                      Download
                    </a>
                    <button
                      className="secondary-btn"
                      onClick={() =>
                        navigator.share
                          ? navigator.share({ title: "Bill PDF", url: getPdfUrl(file) })
                          : window.open(getPdfUrl(file), "_blank")
                      }
                    >
                      Share
                    </button>
                  </div>
                </div>
              ))}

            {type === "expenses" && data.map((row) => (
              <div key={row.id} className="mobile-card" style={{ marginBottom: 10 }}>
                <div><b>Date:</b> {new Date(row.expense_date).toLocaleDateString()}</div>
                <div><b>Description:</b> {row.description}</div>
                <div><b>Amount:</b> ₹{row.amount}</div>
                <div><b>Status:</b> {row.status}</div>
                {row.voucher_files?.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <b>Files:</b>{" "}
                    {row.voucher_files.map((file, idx) => (
                      <a
                        key={idx}
                        href={getPdfUrl(file)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ marginRight: 8, color: "var(--primary)" }}
                      >
                        {file.split("/").pop()}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {type === "ticket-system" && data.map((row) => (
              <div key={row.id} className="mobile-card" style={{ marginBottom: 10 }}>
                <div><b>Date:</b> {new Date(row.ticket_date).toLocaleDateString()}</div>
                <div><b>Assigned To:</b> {row.assigned_to || "-"}</div>
                <div><b>Description:</b> {row.description}</div>
                <div><b>Status:</b> {row.status}</div>
                {row.voucher_files?.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <b>Files:</b>{" "}
                    {row.voucher_files.map((file, idx) => (
                      <a
                        key={idx}
                        href={getPdfUrl(file)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ marginRight: 8, color: "var(--primary)" }}
                      >
                        {file.split("/").pop()}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {!loading && type !== "bills" && data.length === 0 && (
              <p style={{ textAlign: "center" }}>No history records</p>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen PDF Viewer */}
      {previewPdf && (
        <div
          onClick={() => setPreviewPdf(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 9999
          }}
        >
          <iframe
            src={previewPdf}
            title="PDF Viewer"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}
    </div>
  );
}
