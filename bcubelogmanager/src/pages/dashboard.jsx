// src/pages/Logs/Dashboard.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  Info,
  X,
  Check,
  ExternalLink,
  FileText,
  Clock,
  Server,
  Globe,
  Tag,
  BarChart3,
  Plus,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Hash,
  Activity,
  Moon,
  Sun,
} from "lucide-react";
import LogDetailModal from "../components/logs/logDetailModel";
import DeleteConfirmationModal from "../components/ui/DeleteConfirmationModal";
import TimezoneDeleteModal from "../components/logs/timeZoneDeleteModel";
import { toast } from "react-hot-toast";
import apiFetch from "../service/api";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/themeContext";
const LIMIT = 20;

const LogDashboard = () => {
  const { projectId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { theme, setTheme } = useContext(ThemeContext);
  const { logout } = useAuth();

  // const user = sessionStorage.getItem("project");

  // const [expandedLogs, setExpandedLogs] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    level: "",
    search: "",
    from: "",
    to: "",
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    error: 0,
    warning: 0,
    info: 0,
    debug: 0,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Build query parameters
      const params = {
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
      };

      // Add filters if they exist
      if (filters.level) params.level = filters.level;
      if (filters.category) params.category = filters.category;
      if (filters.service) params.service = filters.service;
      if (filters.search) params.search = filters.search;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      // Serialize params into query string
      const queryString = new URLSearchParams(params).toString();
      const response = await apiFetch(`/api/v1/logs/dashboard?${queryString}`);

      if (response && response.items) {
        setLogs(response.items);
        setTotal(response.total || 0);

        // Calculate stats
        const levelCounts = response.items.reduce((acc, log) => {
          acc[log.level] = (acc[log.level] || 0) + 1;
          return acc;
        }, {});

        setStats({
          total: response.total || 0,
          error: levelCounts.ERROR || 0,
          warning: levelCounts.WARN || 0,
          info: levelCounts.INFO || 0,
          debug: levelCounts.DEBUG || 0,
        });
      } else {
        setError(response?.message || "Failed to fetch logs");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }, [projectId, page, filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiFetch("/api/v1/logs/categories");
      if (response && response.items) {
        setCategories(response.items);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!filters.search) return;

    setLoading(true);
    try {
      const response = await apiFetch("/api/v1/logs/search", {
        params: {
          q: filters.search,
          limit: LIMIT,
          offset: (page - 1) * LIMIT,
        },
      });

      if (response && response.items) {
        setLogs(response.items);
        setTotal(response.total || 0);
      }
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, [filters.search, page]);

  const handleDeleteLog = async (logId) => {
    try {
      const response = await apiFetch(`/api/v1/logs/${logId}`, {
        method: "DELETE",
      });

      if (response && !response.message) {
        toast.success("Log deleted successfully");
        fetchLogs();
      } else {
        toast.error(response?.message || "Failed to delete log");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete log");
    }
  };

  const handleBulkDelete = async (timezoneOffset) => {
    try {
      const response = await apiFetch("/api/v1/logs/bulk/by-timezone", {
        method: "DELETE",
        params: { timezone_offset: timezoneOffset },
      });

      if (response && !response.message) {
        toast.success("Logs deleted successfully");
        fetchLogs();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete logs");
    }
  };

  // const toggleLogExpansion = (logId) => {
  //   setExpandedLogs(prev => ({
  //     ...prev,
  //     [logId]: !prev[logId]
  //   }));
  // };

  const clearFilters = () => {
    setFilters({
      level: "",
      search: "",
      from: "",
      to: "",
    });
    setPage(1);
  };

  const exportLogs = () => {
    const csvContent = logs
      .map(
        (log) =>
          `${log.id},${log.timestamp},${log.level},${log.service},${log.environment},"${log.message}"`
      )
      .join("\n");

    const blob = new Blob(
      [`id,timestamp,level,service,environment,message\n${csvContent}`],
      { type: "text/csv" }
    );
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchLogs();
    fetchCategories();
  }, [fetchLogs, fetchCategories]);

  const totalPages = Math.ceil(total / LIMIT);

  const getLevelBadgeClass = (level) => {
    switch (level?.toUpperCase()) {
      case "ERROR":
        return "badge-error";
      case "WARN":
        return "badge-warning";
      case "INFO":
        return "badge-info";
      case "DEBUG":
        return "badge-neutral";
      default:
        return "badge-ghost";
    }
  };

  const getLevelIcon = (level) => {
    switch (level?.toUpperCase()) {
      case "ERROR":
        return <AlertCircle className="w-4 h-4" />;
      case "WARN":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case "INFO":
        return <Info className="w-4 h-4" />;
      case "DEBUG":
        return <Activity className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="bg-base-100 rounded-xl shadow p-4 md:p-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Logs Manager</h1>
        </div>

        <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
          <button
            className="btn btn-square"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </button>
          <button className="btn btn-outline btn-error" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="card bg-base-100 shadow-sm border">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-title text-sm">Total Logs</div>
                  <div className="stat-value text-lg">{stats.total}</div>
                </div>
                <BarChart3 className="w-8 h-8 text-primary/40" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-title text-sm">Errors</div>
                  <div className="stat-value text-lg text-error">
                    {stats.error}
                  </div>
                </div>
                <AlertCircle className="w-8 h-8 text-error/40" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-title text-sm">Warnings</div>
                  <div className="stat-value text-lg text-warning">
                    {stats.warning}
                  </div>
                </div>
                <AlertCircle className="w-8 h-8 text-warning/40" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-title text-sm">Info</div>
                  <div className="stat-value text-lg text-info">
                    {stats.info}
                  </div>
                </div>
                <Info className="w-8 h-8 text-info/40" />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-title text-sm">Debug</div>
                  <div className="stat-value text-lg text-base-content">
                    {stats.debug}
                  </div>
                </div>
                <Activity className="w-8 h-8 text-base-content/40" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="card shadow-lg mb-6">
          <div className="card-body p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="form-control w-full md:w-auto flex-1">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search logs..."
                    className="input input-bordered w-full"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn btn-outline btn-sm gap-2"
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
                <button
                  onClick={exportLogs}
                  className="btn btn-outline btn-sm gap-2"
                  disabled={logs.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                {/* <button
                  onClick={() => setShowTimezoneModal(true)}
                  className="btn btn-outline btn-error btn-sm gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Bulk Delete
                </button> */}
                <button
                  onClick={fetchLogs}
                  className="btn btn-outline btn-sm gap-2"
                  disabled={loading}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>
            {showFilters && (
              <div className="mt-4 p-4 bg-base-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Level</span>
                    </label>
                    <select
                      className="select select-bordered select-sm"
                      value={filters.level}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          level: e.target.value,
                        }))
                      }
                    >
                      <option value="">All Levels</option>
                      <option value="ERROR">Error</option>
                      <option value="WARN">Warning</option>
                      <option value="INFO">Info</option>
                      <option value="DEBUG">Debug</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Date Range</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        className="input input-bordered input-sm flex-1"
                        value={filters.from}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            from: e.target.value,
                          }))
                        }
                      />
                      <input
                        type="date"
                        className="input input-bordered input-sm flex-1"
                        value={filters.to}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            to: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end  gap-2 mt-4">
                  <button
                    onClick={clearFilters}
                    className="btn btn-secondary btn-sm"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={fetchLogs}
                    className="btn btn-primary btn-sm"
                  >
                    Apply Filters
                  </button>
                </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setError("")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Logs Table */}
        <div className="card shadow-lg">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No logs found</h3>
                  <p className="text-base-content/70">
                    {filters.search || filters.level || filters.category
                      ? "No logs match your filters. Try adjusting your criteria."
                      : "No logs available. Start by ingesting some logs."}
                  </p>
                </div>
              ) : (
                <>
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Service</th>
                        <th>Environment</th>
                        <th>Message</th>
                        <th className="w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <React.Fragment key={log.id}>
                          <tr>
                            {/* <td>
                              <button
                                onClick={() => toggleLogExpansion(log.id)}
                                className="btn btn-ghost btn-xs"
                              >
                                {expandedLogs[log.id] ? 
                                  <ChevronUp className="w-4 h-4" /> : 
                                  <ChevronDown className="w-4 h-4" />
                                }
                              </button>
                            </td> */}
                            <td>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-base-content/40" />
                                {new Date(log.timestamp).toLocaleString()}
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                {getLevelIcon(log.level)}
                                <span
                                  className={`badge badge-sm ${getLevelBadgeClass(
                                    log.level
                                  )}`}
                                >
                                  {log.level}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-base-content/40" />
                                <span className="text-sm">
                                  {log.service || "-"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-base-content/40" />
                                <span className="text-sm">
                                  {log.environment || "-"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-base-content/40" />
                                <span
                                  className="max-w-xs truncate"
                                  title={log.message}
                                >
                                  {log.message}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setSelectedLog(log);
                                    setShowDetailModal(true);
                                  }}
                                  className="btn btn-ghost btn-xs"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedLog(log);
                                    setShowDeleteModal(true);
                                  }}
                                  className="btn btn-ghost btn-xs text-error"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {logs.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="text-sm text-base-content/70">
              Showing {(page - 1) * LIMIT + 1} to{" "}
              {Math.min(page * LIMIT, total)} of {total} logs
            </div>

            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`join-item btn btn-sm ${
                      page === pageNum ? "btn-primary" : ""
                    }`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="join-item btn btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailModal && selectedLog && (
        <LogDetailModal
          log={selectedLog}
          categories={categories}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedLog(null);
          }}
        />
      )}

      {showDeleteModal && selectedLog && (
        <DeleteConfirmationModal
          title="Delete Log"
          message={`Are you sure you want to delete log #${selectedLog.id}? This action cannot be undone.`}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedLog(null);
          }}
          onConfirm={() => {
            handleDeleteLog(selectedLog.id);
            setShowDeleteModal(false);
            setSelectedLog(null);
          }}
        />
      )}

      {showTimezoneModal && (
        <TimezoneDeleteModal
          onClose={() => setShowTimezoneModal(false)}
          onConfirm={handleBulkDelete}
        />
      )}
    </div>
  );
};

export default LogDashboard;
