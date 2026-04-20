"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Eye,
  Edit,
  Trash2,
  Save,
  XCircle,
  CheckCircle,
  AlertCircle,
  UserCheck,
  DollarSign,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  Send,
  Filter,
  Calendar,
  ChevronDown,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";

interface UserAccount {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  account_number: string;
  balance: string;
  account_status: string;
  is_verified: boolean;
  account_type: any;
  currency: string;
  country: string;
  occupation: string;
  source_of_funds: string;
  annual_income_range: string;
  created_at: string;
  user: string;
}

interface Transaction {
  id: number;
  transaction_id: string;
  transaction_type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  amount: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  description: string;
  recipient_account?: string;
  created_at: string;
  user?: number;
}

function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "customers" | "transactions" | "analytics"
  >("customers");
  const [customers, setCustomers] = useState<UserAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<UserAccount | null>(
    null
  );
  const [editingCustomer, setEditingCustomer] = useState<UserAccount | null>(
    null
  );
  const [customerEditForm, setCustomerEditForm] = useState({
    account_status: "",
    is_verified: false,
    account_type_id: "",
    occupation: "",
    source_of_funds: "",
    annual_income_range: "",
    country: "",
  });
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    status: "",
    description: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [customerStatusFilter, setCustomerStatusFilter] = useState<string>("ALL");
  const [customerVerifiedFilter, setCustomerVerifiedFilter] = useState<string>("ALL");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [customersRes, transactionsRes] = await Promise.all([
        api.get("v2/bank/admin/customers/"),
        api.get("v2/bank/admin/transactions/"),
      ]);
      setCustomers(customersRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      showToast("Failed to load admin data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredCustomers = async () => {
    setIsLoading(true);
    try {
      let url = "v2/bank/admin/customers/";
      const params = new URLSearchParams();
      
      if (searchTerm) params.append("search", searchTerm);
      if (customerStatusFilter !== "ALL") params.append("status", customerStatusFilter);
      if (customerVerifiedFilter !== "ALL") params.append("verified", customerVerifiedFilter === "VERIFIED" ? "true" : "false");
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await api.get(url);
      setCustomers(response.data);
    } catch (error) {
      console.error("Failed to fetch filtered customers:", error);
      showToast("Failed to load customers", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (activeTab === "customers") {
        fetchFilteredCustomers();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, customerStatusFilter, customerVerifiedFilter, activeTab]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleEditCustomer = (customer: UserAccount) => {
    setEditingCustomer(customer);
    setCustomerEditForm({
      account_status: customer.account_status,
      is_verified: customer.is_verified,
      account_type_id: customer.account_type?.id || "",
      occupation: customer.occupation || "",
      source_of_funds: customer.source_of_funds || "",
      annual_income_range: customer.annual_income_range || "",
      country: customer.country || "",
    });
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    setIsUpdating(true);
    try {
      await api.put("v2/bank/admin/customers/", {
        id: editingCustomer.id,
        account_status: customerEditForm.account_status,
        is_verified: customerEditForm.is_verified,
        occupation: customerEditForm.occupation,
        source_of_funds: customerEditForm.source_of_funds,
        annual_income_range: customerEditForm.annual_income_range,
        country: customerEditForm.country,
      });
      await fetchFilteredCustomers();
      setEditingCustomer(null);
      showToast("Customer updated successfully", "success");
    } catch (error) {
      console.error("Failed to update customer:", error);
      showToast("Failed to update customer", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer account?")) return;
    try {
      await api.delete("v2/bank/admin/customers/", {
        data: { id: customerId }
      });
      setCustomers(customers.filter((c) => c.id !== customerId));
      showToast("Customer deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete customer:", error);
      showToast("Failed to delete customer", "error");
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm({
      amount: transaction.amount,
      status: transaction.status,
      description: transaction.description,
    });
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction) return;
    setIsUpdating(true);
    try {
      await api.patch(`v2/bank/admin/transactions/${editingTransaction.id}/`, {
        amount: parseFloat(editForm.amount),
        status: editForm.status,
        description: editForm.description,
      });
      const transactionsRes = await api.get("v2/bank/admin/transactions/");
      setTransactions(transactionsRes.data);
      setEditingTransaction(null);
      showToast("Transaction updated successfully", "success");
    } catch (error) {
      console.error("Failed to update transaction:", error);
      showToast("Failed to update transaction", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`v2/bank/admin/transactions/${transactionId}/`);
      setTransactions(transactions.filter((t) => t.id !== transactionId));
      showToast("Transaction deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      showToast("Failed to delete transaction", "error");
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    const matchesType = filterType === "ALL" || t.transaction_type === filterType;
    const matchesSearch =
      !searchTerm ||
      t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const totalBalance = customers.reduce(
    (sum, c) => sum + parseFloat(c.balance || "0"),
    0
  );
  const totalTransactions = transactions.length;
  const pendingTransactions = transactions.filter((t) => t.status === "PENDING").length;

  const NavItem = ({
    icon,
    label,
    id,
  }: {
    icon: React.ReactNode;
    label: string;
    id: "customers" | "transactions" | "analytics";
  }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsSidebarOpen(false);
      }}
      className={"w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group " + (activeTab === id ? "bg-[#D4AF37] text-black font-bold shadow-lg shadow-[#D4AF37]/20" : "text-gray-400 hover:text-white hover:bg-white/5")}
    >
      <span className={activeTab === id ? "text-black" : "group-hover:text-[#D4AF37]"}>{icon}</span>
      <span className="text-sm tracking-wide">{label}</span>
    </button>
  );

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={"p-3 rounded-xl " + color}>{icon}</div>
      </div>
    </div>
  );

  const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
    let statusColor = "";
    if (transaction.status === "COMPLETED") statusColor = "bg-green-50 text-green-600";
    else if (transaction.status === "PENDING") statusColor = "bg-orange-50 text-orange-600";
    else statusColor = "bg-red-50 text-red-600";

    let iconDivColor = "";
    let iconElement = null;
    if (transaction.transaction_type === "DEPOSIT") {
      iconDivColor = "bg-green-50";
      iconElement = <ArrowDownCircle size={16} className="text-green-600" />;
    } else if (transaction.transaction_type === "WITHDRAWAL") {
      iconDivColor = "bg-red-50";
      iconElement = <ArrowUpCircle size={16} className="text-red-600" />;
    } else {
      iconDivColor = "bg-blue-50";
      iconElement = <Send size={16} className="text-blue-600" />;
    }

    const amountNum = parseFloat(transaction.amount);
    const isPositive = transaction.transaction_type === "DEPOSIT";

    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
        <div className="flex items-center gap-4 flex-1">
          <div className={"p-2.5 rounded-xl " + iconDivColor}>
            {iconElement}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">
              {transaction.transaction_type}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">
              {new Date(transaction.created_at).toLocaleDateString()} •{" "}
              {transaction.description.slice(0, 30)}
            </p>
          </div>
          <div className="hidden md:block">
            <span className={"px-3 py-1 rounded-full text-[10px] font-bold uppercase " + statusColor}>
              {transaction.status}
            </span>
          </div>
          <p className={"text-sm font-bold " + (isPositive ? "text-green-600" : "text-slate-900")}>
            {isPositive ? "+" : "-"}$
            {Math.abs(amountNum).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEditTransaction(transaction)}
              className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-blue-600"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleDeleteTransaction(transaction.id)}
              className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EditCustomerModal = () => {
    if (!editingCustomer) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
            <h3 className="font-bold text-2xl">Edit Customer</h3>
            <button
              onClick={() => setEditingCustomer(null)}
              className="p-2 hover:bg-gray-100 rounded-2xl"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                Customer Name
              </label>
              <p className="text-sm font-medium bg-gray-50 p-3 rounded-xl">
                {editingCustomer.first_name} {editingCustomer.last_name}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                Account Status
              </label>
              <select
                value={customerEditForm.account_status}
                onChange={(e) =>
                  setCustomerEditForm({ ...customerEditForm, account_status: e.target.value })
                }
                className="w-full px-5 py-4 border border-gray-200 focus:border-[#D4AF37] rounded-2xl text-lg outline-none bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                Verification Status
              </label>
              <select
                value={customerEditForm.is_verified ? "true" : "false"}
                onChange={(e) =>
                  setCustomerEditForm({ ...customerEditForm, is_verified: e.target.value === "true" })
                }
                className="w-full px-5 py-4 border border-gray-200 focus:border-[#D4AF37] rounded-2xl text-lg outline-none bg-white"
              >
                <option value="true">VERIFIED</option>
                <option value="false">UNVERIFIED</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                Occupation
              </label>
              <input
                type="text"
                value={customerEditForm.occupation}
                onChange={(e) =>
                  setCustomerEditForm({ ...customerEditForm, occupation: e.target.value })
                }
                className="w-full px-5 py-4 border border-gray-200 focus:border-[#D4AF37] rounded-2xl text-lg outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                Source of Funds
              </label>
              <input
                type="text"
                value={customerEditForm.source_of_funds}
                onChange={(e) =>
                  setCustomerEditForm({ ...customerEditForm, source_of_funds: e.target.value })
                }
                className="w-full px-5 py-4 border border-gray-200 focus:border-[#D4AF37] rounded-2xl text-lg outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                Annual Income Range
              </label>
              <input
                type="text"
                value={customerEditForm.annual_income_range}
                onChange={(e) =>
                  setCustomerEditForm({ ...customerEditForm, annual_income_range: e.target.value })
                }
                className="w-full px-5 py-4 border border-gray-200 focus:border-[#D4AF37] rounded-2xl text-lg outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                Country
              </label>
              <input
                type="text"
                value={customerEditForm.country}
                onChange={(e) =>
                  setCustomerEditForm({ ...customerEditForm, country: e.target.value })
                }
                className="w-full px-5 py-4 border border-gray-200 focus:border-[#D4AF37] rounded-2xl text-lg outline-none"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditingCustomer(null)}
                className="flex-1 py-4 text-gray-400 font-bold border border-gray-200 rounded-2xl"
              >
                CANCEL
              </button>
              <button
                onClick={handleUpdateCustomer}
                disabled={isUpdating}
                className="flex-1 py-4 bg-[#D4AF37] text-black font-bold rounded-2xl hover:bg-[#f5cc45] transition disabled:opacity-50"
              >
                {isUpdating ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EditTransactionModal = () => {
    if (!editingTransaction) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-3xl max-w-md w-full">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="font-bold text-2xl">Edit Transaction</h3>
            <button
              onClick={() => setEditingTransaction(null)}
              className="p-2 hover:bg-gray-100 rounded-2xl"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                Transaction ID
              </label>
              <p className="text-sm font-mono bg-gray-50 p-3 rounded-xl">
                {editingTransaction.transaction_id}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
                className="w-full px-5 py-4 border border-gray-200 focus:border-[#D4AF37] rounded-2xl text-lg outline-none"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
                className="w-full px-5 py-4 border border-gray-200 focus:border-[#D4AF37] rounded-2xl text-lg outline-none bg-white"
              >
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="w-full px-5 py-4 border border-gray-200 focus:border-[#D4AF37] rounded-2xl h-28 resize-none outline-none"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditingTransaction(null)}
                className="flex-1 py-4 text-gray-400 font-bold border border-gray-200 rounded-2xl"
              >
                CANCEL
              </button>
              <button
                onClick={handleUpdateTransaction}
                disabled={isUpdating}
                className="flex-1 py-4 bg-[#D4AF37] text-black font-bold rounded-2xl hover:bg-[#f5cc45] transition disabled:opacity-50"
              >
                {isUpdating ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CustomerDetailModal = ({
    customer,
    onClose,
  }: {
    customer: UserAccount;
    onClose: () => void;
  }) => {
    const customerTransactions = transactions.filter(
      (t) => t.user === parseInt(customer.user)
    );
    const totalSpent = customerTransactions
      .filter((t) => t.transaction_type !== "DEPOSIT")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
          <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
            <h3 className="font-bold text-2xl">Customer Details</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-2xl">
              <X size={24} />
            </button>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#f5e0a3] flex items-center justify-center text-black text-2xl font-black">
                {customer.first_name[0]}{customer.last_name[0]}
              </div>
              <div>
                <h4 className="text-xl font-bold">
                  {customer.first_name} {customer.last_name}
                </h4>
                <p className="text-gray-500">{customer.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={"text-xs font-bold px-2 py-1 rounded-full " + (customer.is_verified ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600")}>
                    {customer.is_verified ? "Verified" : "Unverified"}
                  </span>
                  <span className={"text-xs font-bold px-2 py-1 rounded-full " + (customer.account_status === "ACTIVE" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
                    {customer.account_status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">
                  Account Number
                </p>
                <p className="font-mono text-sm">{customer.account_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">
                  Balance
                </p>
                <p className="text-2xl font-bold text-[#D4AF37]">
                  ${parseFloat(customer.balance).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">
                  Account Type
                </p>
                <p>{customer.account_type?.name || "Standard"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">
                  Total Spent
                </p>
                <p className="text-red-600 font-bold">
                  ${totalSpent.toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-bold mb-4">Recent Transactions</h5>
              {customerTransactions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No transactions found
                </p>
              ) : (
                <div className="space-y-2">
                  {customerTransactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-sm">{tx.transaction_type}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className={"font-bold " + (tx.transaction_type === "DEPOSIT" ? "text-green-600" : "text-slate-800")}>
                        {tx.transaction_type === "DEPOSIT" ? "+" : "-"}$
                        {parseFloat(tx.amount).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={"fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0B1221] text-white transform " + (isSidebarOpen ? "translate-x-0" : "-translate-x-full") + " lg:translate-x-0 transition-transform duration-400 ease-out flex flex-col"}
      >
        <div className="p-8 flex justify-between items-center">
          <img
            src="/logo_no_bg.png"
            alt="Admin Logo"
            className="h-12 w-auto object-contain brightness-0 invert"
          />
          <button
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 mb-6">
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold">
              Admin Access
            </p>
            <p className="text-sm font-bold mt-1">Valtro Admin Portal</p>
            <p className="text-[10px] text-gray-400 mt-1">
              Full system control
            </p>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1.5">
          <NavItem icon={<Users size={20} />} label="Customers" id="customers" />
          <NavItem
            icon={<Receipt size={20} />}
            label="Transactions"
            id="transactions"
          />
          <NavItem
            icon={<TrendingUp size={20} />}
            label="Analytics"
            id="analytics"
          />
        </nav>

        <div className="p-6 m-6 bg-white/5 rounded-3xl border border-white/5">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-400 transition-colors py-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center bg-gray-50 px-4 py-2.5 rounded-2xl w-64 lg:w-96 ring-1 ring-gray-100 focus-within:ring-[#D4AF37] transition-all">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search customers or transactions..."
                className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => activeTab === "customers" ? fetchFilteredCustomers() : fetchAllData()}
              className="p-2.5 text-gray-400 bg-gray-50 rounded-xl hover:text-black transition"
            >
              <RefreshCw size={20} />
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37] flex items-center justify-center text-black font-bold">
                AD
              </div>
              <span className="hidden sm:inline text-sm font-medium">
                Admin
              </span>
            </div>
          </div>
        </header>

        <div className="p-5 lg:p-10 overflow-y-auto h-[calc(100vh-5rem)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Customers"
              value={customers.length}
              icon={<Users size={24} />}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              title="Total Balance"
              value={"$" + totalBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
              icon={<DollarSign size={24} />}
              color="bg-green-50 text-green-600"
            />
            <StatCard
              title="Pending Transactions"
              value={pendingTransactions}
              icon={<AlertCircle size={24} />}
              color="bg-orange-50 text-orange-600"
            />
          </div>

          {activeTab === "customers" && (
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold">All Customers</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Manage and monitor all registered users
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={customerStatusFilter}
                      onChange={(e) => setCustomerStatusFilter(e.target.value)}
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D4AF37]"
                    >
                      <option value="ALL">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    <select
                      value={customerVerifiedFilter}
                      onChange={(e) => setCustomerVerifiedFilter(e.target.value)}
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D4AF37]"
                    >
                      <option value="ALL">All Verification</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="UNVERIFIED">Unverified</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-50">
                      <th className="p-4 font-bold">Customer</th>
                      <th className="p-4 font-bold">Account Number</th>
                      <th className="p-4 font-bold">Balance</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold">Verification</th>
                      <th className="p-4 font-bold">Joined</th>
                      <th className="p-4 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-sm">
                              {customer.first_name} {customer.last_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {customer.email}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm">
                          {customer.account_number}
                        </td>
                        <td className="p-4 font-bold text-[#D4AF37]">
                          ${parseFloat(customer.balance).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={"px-2 py-1 rounded-full text-[10px] font-bold " + (customer.account_status === "ACTIVE" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
                            {customer.account_status}
                          </span>
                        </td>
                        <td className="p-4">
                          {customer.is_verified ? (
                            <CheckCircle size={18} className="text-green-500" />
                          ) : (
                            <XCircle size={18} className="text-red-400" />
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-blue-600 transition"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditCustomer(customer)}
                              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-green-600 transition"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-red-600 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {customers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    No customers found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="bg-white rounded-3xl border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold">All Transactions</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      View, edit, or delete any transaction
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D4AF37]"
                    >
                      <option value="ALL">All Status</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending</option>
                      <option value="FAILED">Failed</option>
                    </select>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D4AF37]"
                    >
                      <option value="ALL">All Types</option>
                      <option value="DEPOSIT">Deposit</option>
                      <option value="WITHDRAWAL">Withdrawal</option>
                      <option value="TRANSFER">Transfer</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {filteredTransactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    No transactions found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-100">
                  <h3 className="font-bold mb-4">Transaction Volume by Type</h3>
                  <div className="space-y-4">
                    {["DEPOSIT", "WITHDRAWAL", "TRANSFER"].map((type) => {
                      const count = transactions.filter(
                        (t) => t.transaction_type === type
                      ).length;
                      const total = transactions.reduce(
                        (sum, t) =>
                          t.transaction_type === type
                            ? sum + parseFloat(t.amount)
                            : sum,
                        0
                      );
                      return (
                        <div key={type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{type.toLowerCase()}</span>
                            <span className="font-bold">
                              {count} txns (${total.toLocaleString()})
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#D4AF37] rounded-full"
                              style={{
                                width: totalTransactions > 0 ? (count / totalTransactions) * 100 + "%" : "0%",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-gray-100">
                  <h3 className="font-bold mb-4">Customer Status</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Verified</span>
                        <span className="font-bold">
                          {customers.filter((c) => c.is_verified).length}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: customers.length > 0 ? (customers.filter((c) => c.is_verified).length / customers.length) * 100 + "%" : "0%",
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Active Accounts</span>
                        <span className="font-bold">
                          {customers.filter((c) => c.account_status === "ACTIVE")
                            .length}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: customers.length > 0 ? (customers.filter((c) => c.account_status === "ACTIVE").length / customers.length) * 100 + "%" : "0%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100">
                <h3 className="font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className={"p-2 rounded-lg " + (tx.transaction_type === "DEPOSIT" ? "bg-green-100" : "bg-red-100")}>
                          {tx.transaction_type === "DEPOSIT" ? (
                            <ArrowDownCircle size={14} className="text-green-600" />
                          ) : (
                            <ArrowUpCircle size={14} className="text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(tx.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className={"font-bold text-sm " + (tx.transaction_type === "DEPOSIT" ? "text-green-600" : "text-slate-800")}>
                        {tx.transaction_type === "DEPOSIT" ? "+" : "-"}$
                        {parseFloat(tx.amount).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
      {editingCustomer && <EditCustomerModal />}
      {editingTransaction && <EditTransactionModal />}

      {toast.show && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-from-bottom-4 duration-300">
          <div className={"flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg " + (toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white")}>
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;