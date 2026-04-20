"use client"
import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Send, ArrowDownCircle, ArrowUpCircle, 
  CreditCard, History, Bell, User, Plus, TrendingUp, Search,
  ArrowRightLeft, Settings, LogOut, Menu, X, CheckCircle2, ShieldCheck,
  Eye, EyeOff, Copy, Check, AlertCircle, Lock, Smartphone, Globe
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '@/lib/api';

const Dashboard = () => {
  // --- STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [balance, setBalance] = useState(12450.00);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [userAccount, setUserAccount] = useState<any>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  // Set mounted state to true after the first render to avoid hydration mismatch
  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      router.replace('/');
      return;
    }

    setIsMounted(true);
    
    // Load real user data from localStorage
    const storedAccount = localStorage.getItem('user_account');
    if (storedAccount) {
      const parsed = JSON.parse(storedAccount);
      setUserAccount(parsed);
      setBalance(parseFloat(parsed.balance));
    }

    fetchTransactions();
    fetchCards();
  }, []);

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const response = await api.get('v2/bank/customer/transactions/');
      
      // Map API data to UI format
      const mappedTransactions = response.data.map((tx: any) => {
        // Determine icon based on type
        let icon = <ArrowDownCircle size={16}/>;
        if (tx.transaction_type === 'WITHDRAWAL') icon = <ArrowUpCircle size={16}/>;
        if (tx.transaction_type === 'TRANSFER') icon = <Send size={16}/>;

        // Parse amount (make negative for outflows if API returns positive values)
        const rawAmount = parseFloat(tx.amount);
        const amount = (tx.transaction_type === 'DEPOSIT') ? rawAmount : -rawAmount;

        return {
          id: tx.transaction_id,
          type: tx.transaction_type.charAt(0) + tx.transaction_type.slice(1).toLowerCase(),
          status: tx.status.charAt(0) + tx.status.slice(1).toLowerCase(),
          amount: amount,
          date: new Date(tx.created_at),
          icon: icon,
          description: tx.description,
          recipient: tx.recipient_account
        };
      });

      setTransactions(mappedTransactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      // Fallback to empty or keep previous on error
    } finally {
      setIsLoadingTransactions(false);
    }
  };
  
  const fetchCards = async () => {
    setIsLoadingCards(true);
    try {
      const response = await api.get('v2/bank/cards/');
      setCards(response.data);
    } catch (error) {
      console.error("Failed to fetch cards:", error);
    } finally {
      setIsLoadingCards(false);
    }
  };
  
  // Transactions Data State
  const [transactions, setTransactions] = useState<any[]>([]);

  const [filterRange, setFilterRange] = useState('All');

  // Modal states
  const [transactionType, setTransactionType] = useState<'DEPOSIT' | 'TRANSFER' | 'WITHDRAWAL'>('TRANSFER');
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendForm, setSendForm] = useState({ recipient: '', amount: '', note: '' });

  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [addCardForm, setAddCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const [isTxDetailOpen, setIsTxDetailOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  // Security View State (Moved up to prevent focus loss during typing)
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'Payment Received', message: '+$2100 from Acme Corp', time: '2m ago', read: false },
    { id: 2, title: 'Card Approved', message: 'Your new Platinum card is now active', time: '1h ago', read: true },
    { id: 3, title: 'Security Alert', message: 'New login detected from New York', time: '3h ago', read: false },
  ]);

  // Fake chart data that updates with balance
  const chartData = useMemo(() => {
    return [
      { name: 'Mon', value: balance * 0.65 },
      { name: 'Tue', value: balance * 0.78 },
      { name: 'Wed', value: balance * 0.92 },
      { name: 'Thu', value: balance * 0.85 },
      { name: 'Fri', value: balance * 1.0 },
      { name: 'Sat', value: balance * 0.95 },
      { name: 'Sun', value: balance },
    ];
  }, [balance]);

  // --- FILTER LOGIC ---
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(tx => {
      if (filterRange === 'Today') return tx.date.toDateString() === now.toDateString();
      if (filterRange === 'Yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return tx.date.toDateString() === yesterday.toDateString();
      }
      if (filterRange === '7Days') return (now.getTime() - tx.date.getTime()) <= 7 * 86400000;
      return true;
    });
  }, [transactions, filterRange]);

  // --- TRANSACTION HANDLER ---
  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.amount) return;
    if (transactionType === 'TRANSFER' && !sendForm.recipient) return;

    const amountNum = parseFloat(sendForm.amount);
    
    // Basic validation for withdrawals and transfers
    if (transactionType !== 'DEPOSIT' && (amountNum <= 0 || amountNum > balance)) {
      alert("Invalid amount or insufficient balance!");
      return;
    }

    setIsTransactionLoading(true);
    try {
      const payload: any = {
        transaction_type: transactionType,
        amount: amountNum.toFixed(2),
        description: sendForm.note || (transactionType === 'DEPOSIT' ? "Account Deposit" : transactionType === 'WITHDRAWAL' ? "Account Withdrawal" : `Transfer to ${sendForm.recipient}`)
      };

      if (transactionType === 'TRANSFER') {
        payload.recipient_account_number = sendForm.recipient;
      }

      await api.post('v2/bank/transactions/', payload);
      
      // Refresh the transaction list to show the new pending entry
      fetchTransactions();

      // Update persistence: Sync the balance in localStorage so it persists on refresh
      const storedAccount = localStorage.getItem('user_account');
      if (storedAccount) {
        const parsed = JSON.parse(storedAccount);
        const newBalance = transactionType === 'DEPOSIT' ? parseFloat(parsed.balance) + amountNum : parseFloat(parsed.balance) - amountNum;
        parsed.balance = newBalance.toFixed(2);
        localStorage.setItem('user_account', JSON.stringify(parsed));
      }

      // Update local state for immediate UI feedback
      setBalance(prev => transactionType === 'DEPOSIT' ? prev + amountNum : prev - amountNum);
      
      alert(`✅ ${transactionType.charAt(0) + transactionType.slice(1).toLowerCase()} initiated successfully!`);
      setIsSendModalOpen(false);
      setSendForm({ recipient: '', amount: '', note: '' });
    } catch (error: any) {
      console.error("Transaction failed:", error);
      alert(error.response?.data?.message || error.response?.data?.detail || "Transaction failed. Please try again.");
    } finally {
      setIsTransactionLoading(false);
    }
  };

  // --- ADD CARD HANDLER ---
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCardForm.number || !addCardForm.expiry) return;
    
    setIsCreatingCard(true);
    try {
      // Format MM/YY to YYYY-MM-DD (Defaulting to the 1st of the month)
      const parts = addCardForm.expiry.split('/');
      if (parts.length < 2 || !parts[1]) {
        throw new Error("Invalid expiry date format. Please use MM/YY.");
      }

      const month = parts[0].trim();
      const year = parts[1].trim();
      const formattedDate = `20${year}-${month.padStart(2, '0')}-01`;

      const payload = {
        card_number: addCardForm.number.replace(/\s/g, ''),
        card_holder_name: addCardForm.name.toUpperCase(),
        expiration_date: formattedDate,
        cvv: addCardForm.cvv,
        card_type: "CREDIT",
        network: "VISA"
      };

      await api.post('v2/bank/cards/', payload);
      alert("✅ New card issued successfully!");
      setIsAddCardModalOpen(false);
      setAddCardForm({ number: '', expiry: '', cvv: '', name: '' });
      fetchCards(); // Refresh the list
    } catch (error: any) {
      console.error("Card creation failed:", error);
      alert(error.response?.data?.message || error.response?.data?.detail || "Failed to create card.");
    } finally {
      setIsCreatingCard(false);
    }
  };

  // --- SHARED COMPONENTS ---
  const NavItem = ({ icon, label, id }: { icon: React.ReactNode; label: string; id: string }) => (
    <button 
      onClick={() => { 
        setCurrentView(id); 
        setIsSidebarOpen(false); 
      }}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${currentView === id ? 'bg-[#D4AF37] text-black font-bold shadow-lg shadow-[#D4AF37]/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
      <span className={currentView === id ? 'text-black' : 'group-hover:text-[#D4AF37] transition-colors'}>{icon}</span>
      <span className="text-sm tracking-wide">{label}</span>
    </button>
  );

  const TransactionRow = ({ tx }: { tx: any }) => (
    <div 
      onClick={() => {
        setSelectedTx(tx);
        setIsTxDetailOpen(true);
      }}
      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-gray-100"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{tx.icon}</div>
        <div>
          <p className="text-sm font-bold text-slate-800">{tx.type}</p>
          <p className="text-[11px] text-gray-400 font-medium">
            {isMounted ? tx.date.toLocaleDateString() : ''} • {tx.status}
          </p>
        </div>
      </div>
      <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
        {tx.amount > 0 ? '+' : ''}{isMounted ? tx.amount.toLocaleString(undefined, {style:'currency', currency:'USD'}) : ''}
      </p>
    </div>
  );

  const fullName = userAccount ? `${userAccount.first_name} ${userAccount.last_name}` : "Alex Valtro";
  const initials = userAccount ? `${userAccount.first_name[0]}${userAccount.last_name[0]}`.toUpperCase() : "AV";

  const ProfileItem = ({ label, value, color = "text-slate-800" }: { label: string; value: string; color?: string }) => (
    <div className="space-y-1.5">
      <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.15em]">{label}</p>
      <p className={`font-bold text-sm lg:text-base ${color}`}>{value}</p>
    </div>
  );

  // --- SUB-VIEWS ---
  const MainDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">Available Balance</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-400">{userAccount?.currency || '$'}</span>
                <h3 className="text-4xl font-bold text-[#0B1221] mt-1">${isMounted ? balance.toLocaleString(undefined, {minimumFractionDigits: 2}) : ''}</h3>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Acc: {userAccount?.account_number || 'N/A'}</p>
                <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-md uppercase tracking-wider">{userAccount?.account_type?.name || 'Standard'}</span>
              </div>
            </div>
            <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <TrendingUp size={14}/> +2.4%
            </div>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Balance']} />
                <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Virtual Card */}
        <div className="bg-[#0B1221] p-8 rounded-[2rem] text-white flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
          <CreditCard size={32} className="text-[#D4AF37] z-10" />
          <div className="z-10 mt-12">
            <p className="text-xl font-mono tracking-[0.2em]">**** **** **** {userAccount?.account_number?.slice(-4) || '9920'}</p>
            <p className="text-[10px] text-gray-400 mt-2 uppercase">Platinum Member</p>
          </div>
          <button 
            onClick={() => setCurrentView('cards')} 
            className="w-full py-4 bg-[#D4AF37] text-black rounded-2xl font-bold mt-6 hover:bg-[#f5cc45] transition"
          >
            Manage Cards
          </button>
        </div>
      </div>

      {/* Quick Activity */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold">Quick Activity</h4>
          <button 
            onClick={() => setCurrentView('transactions')} 
            className="text-[#D4AF37] text-sm font-bold flex items-center gap-1 hover:underline"
          >
            View History <ArrowRightLeft size={14} />
          </button>
        </div>
        {isLoadingTransactions ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400 font-medium">Syncing transactions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 3).map(tx => <TransactionRow key={tx.id} tx={tx} />)}
            {transactions.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">No recent activity found.</p>}
          </div>
        )}
      </div>
    </div>
  );

  const TransactionView = () => (
    <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-sm text-gray-400">View and filter your financial history</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-gray-50 p-1.5 rounded-2xl">
          {['All', 'Today', 'Yesterday', '7Days'].map(range => (
            <button 
              key={range}
              onClick={() => setFilterRange(range)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${filterRange === range ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
            >
              {range === '7Days' ? 'Last 7 Days' : range}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-50">
              <th className="pb-4 font-bold">Transaction Type</th>
              <th className="pb-4 font-bold">Date</th>
              <th className="pb-4 font-bold">Status</th>
              <th className="pb-4 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTransactions.map(tx => (
              <tr 
                key={tx.id} 
                onClick={() => {
                  setSelectedTx(tx);
                  setIsTxDetailOpen(true);
                }}
                className="group hover:bg-gray-50 transition cursor-pointer"
              >
                <td className="py-5 flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{tx.icon}</div>
                  <span className="font-bold text-sm text-slate-700">{tx.type}</span>
                </td>
                <td className="py-5 text-sm text-gray-500 font-medium">
                  {isMounted ? tx.date.toLocaleDateString() : ''}
                </td>
                <td className="py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${tx.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{tx.status}</span></td>
                <td className={`py-5 text-right font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                  {tx.amount > 0 ? '+' : ''}{isMounted ? tx.amount.toLocaleString(undefined, {style:'currency', currency:'USD'}) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CardsView = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Cards</h2>
        <button 
          onClick={() => setIsAddCardModalOpen(true)}
          className="bg-[#0B1221] text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-black/10"
        >
          <Plus size={18}/> Add Card
        </button>
      </div>
      {isLoadingCards ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400 font-medium">Syncing your virtual cards...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Real cards from API */}
          {cards.map((card) => (
            <div key={card.id} className="aspect-[1.6/1] bg-gradient-to-br from-[#0B1221] to-slate-800 p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden ring-1 ring-white/10">
              <div className="flex justify-between items-start z-10">
                <CreditCard size={32} className="text-[#D4AF37]"/>
                <span className="text-[10px] tracking-[0.3em] font-bold text-[#D4AF37]">VALTRO {card.card_type}</span>
              </div>
              <p className="text-2xl font-mono tracking-[0.25em] z-10">{card.masked_number}</p>
              <div className="flex justify-between text-[11px] uppercase text-gray-400 z-10 font-bold">
                <span>{card.card_holder_name}</span>
                <span>Exp: {card.expiration_date}</span>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
            </div>
          ))}

          {/* Add new card placeholder */}
          <div 
            onClick={() => setIsAddCardModalOpen(true)}
            className="aspect-[1.6/1] border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-400 gap-3 hover:border-[#D4AF37] hover:text-[#D4AF37] transition group cursor-pointer bg-white"
          >
            <div className="p-4 bg-gray-50 rounded-full group-hover:bg-[#D4AF37]/10 transition">
              <Plus size={32} />
            </div>
            <span className="font-bold text-sm tracking-wide">Issue New Card</span>
          </div>
        </div>
      )}
    </div>
  );

  const ProfileView = () => (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 max-w-3xl animate-in slide-in-from-left-4">
      <div className="flex flex-col sm:flex-row items-center gap-8 mb-12">
        <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-[#D4AF37] to-[#f5e0a3] flex items-center justify-center text-black text-4xl font-black shadow-xl shadow-[#D4AF37]/20">{initials}</div>
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{fullName}</h2>
          <div className="flex items-center gap-2 mt-2 text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full w-fit mx-auto sm:mx-0">
            <ShieldCheck size={16}/> {userAccount?.is_verified ? 'KYC Verified' : 'Verification Pending'}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12 border-t border-gray-50 pt-10">
        <ProfileItem label="Account Type" value={userAccount?.account_type?.name || "N/A"} color="text-[#D4AF37]" />
        <ProfileItem label="Account Status" value={userAccount?.account_status || "ACTIVE"} color={userAccount?.account_status === 'ACTIVE' ? "text-green-600" : "text-amber-600"} />
        <ProfileItem label="Account Number" value={userAccount?.account_number || "N/A"} />
        <ProfileItem label="Occupation" value={userAccount?.occupation || "N/A"} />
        <ProfileItem label="Primary Currency" value={userAccount?.currency || "USD"} />
        <ProfileItem label="Source of Funds" value={userAccount?.source_of_funds || "N/A"} />
        <ProfileItem label="Annual Income" value={userAccount?.annual_income_range ? `$${parseFloat(userAccount.annual_income_range).toLocaleString()}` : "N/A"} />
        <ProfileItem label="Country" value={userAccount?.country || "N/A"} />
      </div>
    </div>
  );

  const SecurityView = () => {
    const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordForm.new !== passwordForm.confirm) {
        alert("New passwords do not match!");
        return;
      }
      alert("✅ Password changed successfully!");
      setPasswordForm({ current: '', new: '', confirm: '' });
    };

    return (
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 max-w-2xl animate-in slide-in-from-left-4">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Lock size={24} /> Security Settings
        </h2>
        
        {/* 2FA */}
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl mb-8">
          <div className="flex items-center gap-4">
            <Smartphone size={28} className="text-[#D4AF37]" />
            <div>
              <p className="font-bold">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Protected with SMS + Authenticator app</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-600 font-bold">
            <CheckCircle2 size={20} />
            ENABLED
          </div>
        </div>

        {/* Change Password */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-xs uppercase font-black tracking-widest text-gray-400 mb-2">Current Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#D4AF37] rounded-2xl px-5 py-4 text-sm outline-none"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase font-black tracking-widest text-gray-400 mb-2">New Password</label>
                <input 
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#D4AF37] rounded-2xl px-5 py-4 text-sm outline-none"
                  placeholder="New password"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-black tracking-widest text-gray-400 mb-2">Confirm New Password</label>
                <input 
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#D4AF37] rounded-2xl px-5 py-4 text-sm outline-none"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#0B1221] text-white py-5 rounded-3xl font-bold text-sm tracking-widest hover:bg-black transition"
            >
              UPDATE PASSWORD
            </button>
          </form>
        </div>

        <div className="text-xs text-gray-400 flex items-center gap-2 bg-amber-50 p-4 rounded-3xl">
          <AlertCircle size={16} className="text-amber-500" />
          Last password change: 14 days ago
        </div>
      </div>
    );
  };

  // --- MODALS ---
  const SendMoneyModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-bold text-2xl">
            {transactionType === 'TRANSFER' ? 'Send Money' : 
             transactionType === 'DEPOSIT' ? 'Deposit Funds' : 'Withdraw Funds'}
          </h3>
          <button onClick={() => setIsSendModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-2xl"><X size={24}/></button>
        </div>
        
        <form onSubmit={handleTransaction} className="p-6 space-y-8">
          {transactionType === 'TRANSFER' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Recipient Account Number</label>
              <input 
                type="text"
                value={sendForm.recipient}
                onChange={(e) => setSendForm({...sendForm, recipient: e.target.value})}
                className="w-full px-6 py-5 border border-gray-200 focus:border-[#D4AF37] rounded-3xl text-lg outline-none"
                placeholder="000 000 0000"
                required
                disabled={isTransactionLoading}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-gray-300">$</span>
              <input 
                type="number"
                value={sendForm.amount}
                onChange={(e) => setSendForm({...sendForm, amount: e.target.value})}
                className="w-full px-12 py-5 border border-gray-200 focus:border-[#D4AF37] rounded-3xl text-3xl font-bold outline-none"
                placeholder="0.00"
                step="0.01"
                required
                disabled={isTransactionLoading}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Note (optional)</label>
            <textarea 
              value={sendForm.note}
              onChange={(e) => setSendForm({...sendForm, note: e.target.value})}
              className="w-full px-6 py-5 border border-gray-200 focus:border-[#D4AF37] rounded-3xl h-28 resize-none outline-none"
              placeholder="For dinner last night..."
              disabled={isTransactionLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsSendModalOpen(false)}
              className="flex-1 py-6 text-gray-400 font-bold border border-gray-200 rounded-3xl"
              disabled={isTransactionLoading}
            >
              CANCEL
            </button>
            <button 
              type="submit"
              disabled={isTransactionLoading}
              className="flex-1 py-6 bg-[#D4AF37] text-black font-bold rounded-3xl hover:bg-[#f5cc45] transition disabled:opacity-50"
            >
              {isTransactionLoading ? 'PROCESSING...' : (transactionType === 'TRANSFER' ? 'SEND NOW' : 'CONFIRM')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AddCardModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl max-w-md w-full">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-bold text-2xl">Link New Card</h3>
          <button onClick={() => setIsAddCardModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-2xl"><X size={24}/></button>
        </div>
        
        <form onSubmit={handleAddCard} className="p-6 space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Card Number</label>
            <input 
              type="text"
              value={addCardForm.number}
              onChange={(e) => setAddCardForm({...addCardForm, number: e.target.value})}
              className="w-full px-6 py-5 border border-gray-200 focus:border-[#D4AF37] rounded-3xl text-lg font-mono outline-none"
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              required
              disabled={isCreatingCard}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Expiry Date</label>
              <input 
                type="text"
                value={addCardForm.expiry}
                onChange={(e) => setAddCardForm({...addCardForm, expiry: e.target.value})}
                className="w-full px-6 py-5 border border-gray-200 focus:border-[#D4AF37] rounded-3xl text-lg font-mono outline-none"
                placeholder="MM / YY"
                maxLength={5}
                required
                disabled={isCreatingCard}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">CVV</label>
              <input 
                type="text"
                value={addCardForm.cvv}
                onChange={(e) => setAddCardForm({...addCardForm, cvv: e.target.value})}
                className="w-full px-6 py-5 border border-gray-200 focus:border-[#D4AF37] rounded-3xl text-lg font-mono outline-none"
                placeholder="123"
                maxLength={4}
                required
                disabled={isCreatingCard}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Cardholder Name</label>
            <input 
              type="text"
              value={addCardForm.name}
              onChange={(e) => setAddCardForm({...addCardForm, name: e.target.value})}
              className="w-full px-6 py-5 border border-gray-200 focus:border-[#D4AF37] rounded-3xl text-lg outline-none"
              placeholder="Alex Valtro"
              required
              disabled={isCreatingCard}
            />
          </div>

          <button 
            type="submit"
            disabled={isCreatingCard}
            className="w-full bg-[#0B1221] text-white py-6 rounded-3xl font-bold text-lg tracking-wider hover:bg-black transition mt-4 disabled:opacity-50"
          >
            {isCreatingCard ? 'ISSUING CARD...' : 'LINK CARD'}
          </button>
        </form>
      </div>
    </div>
  );

  const TransactionDetailModal = () => {
    if (!selectedTx) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-2xl">Transaction Details</h3>
            <button onClick={() => setIsTxDetailOpen(false)} className="p-2 hover:bg-gray-100 rounded-2xl"><X size={24}/></button>
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 rounded-2xl ${selectedTx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {selectedTx.icon}
            </div>
            <div className="flex-1">
              <p className="font-bold text-xl">{selectedTx.type}</p>
              <p className="text-gray-500">{selectedTx.description}</p>
            </div>
            <p className={`text-3xl font-bold ${selectedTx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
              {selectedTx.amount > 0 ? '+' : ''}${Math.abs(selectedTx.amount).toFixed(2)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">DATE</p>
              <p className="font-medium">
                {isMounted 
                  ? selectedTx.date.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) 
                  : ''}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">STATUS</p>
              <span className={`inline-block px-6 py-2 rounded-full text-xs font-bold ${selectedTx.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {selectedTx.status}
              </span>
            </div>
          </div>

          <button 
            onClick={() => {
              navigator.clipboard.writeText(`Transaction #${selectedTx.id}`);
              alert("Transaction ID copied to clipboard!");
            }}
            className="mt-12 w-full flex items-center justify-center gap-2 py-4 border border-gray-200 rounded-3xl hover:bg-gray-50 text-sm font-medium"
          >
            <Copy size={18} /> Copy Transaction ID
          </button>
        </div>
      </div>
    );
  };

  const NotificationsModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4" onClick={(e) => e.target === e.currentTarget && setIsNotificationsOpen(false)}>
      <div className="bg-white rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col">
        <div className="p-6 border-b">
          <h3 className="font-bold text-xl flex items-center justify-between">
            Notifications
            <button onClick={() => setIsNotificationsOpen(false)}><X size={22}/></button>
          </h3>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {notifications.map(notif => (
            <div key={notif.id} className="flex gap-4 p-5 hover:bg-gray-50 rounded-3xl cursor-pointer">
              <div className="w-2 h-2 mt-2 bg-[#D4AF37] rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-semibold">{notif.title}</p>
                  <span className="text-[10px] text-gray-400">{notif.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t text-center text-[#D4AF37] text-sm font-bold">
          Mark all as read
        </div>
      </div>
    </div>
  );

  // Prevent rendering protected content until the auth check is performed on the client
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0B1221] text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-400 ease-out flex flex-col`}>
        <div className="p-8 flex justify-between items-center">
          <img src="/logo_no_bg.png" alt="Valtro Logo" className="h-12 w-auto object-contain brightness-0 invert" />
          <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
        </div>
        
        <nav className="flex-1 px-6 space-y-1.5 mt-4">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" id="dashboard" />
          <NavItem icon={<ArrowRightLeft size={20}/>} label="Transactions" id="transactions" />
          <NavItem icon={<CreditCard size={20}/>} label="My Cards" id="cards" />
          <NavItem icon={<User size={20}/>} label="Profile" id="profile" />
          <NavItem icon={<Settings size={20}/>} label="Security" id="security" />
        </nav>

        <div className="p-6 m-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#f5e0a3] flex items-center justify-center text-black font-black text-xs">{initials}</div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{fullName}</p>
            <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">{userAccount?.account_type?.name || 'Standard Account'}</p>
          </div>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="ml-auto text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* HEADER */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition" onClick={() => setIsSidebarOpen(true)}><Menu size={20}/></button>
            <div className="hidden md:flex items-center bg-gray-50 px-4 py-2.5 rounded-2xl w-64 lg:w-96 ring-1 ring-gray-100 focus-within:ring-[#D4AF37] transition-all">
              <Search size={18} className="text-gray-400" />
              <input type="text" placeholder="Search transactions or contacts..." className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 outline-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {/* Notifications */}
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2.5 text-gray-400 bg-gray-50 rounded-xl hover:text-black transition group"
            >
              <Bell size={22} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:animate-ping"></span>
              )}
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button 
                onClick={() => { setTransactionType('DEPOSIT'); setIsSendModalOpen(true); }}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold hover:bg-green-700 transition shadow-sm whitespace-nowrap"
              >
                Deposit
              </button>
              <button 
                onClick={() => { setTransactionType('WITHDRAWAL'); setIsSendModalOpen(true); }}
                className="bg-amber-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold hover:bg-amber-700 transition shadow-sm whitespace-nowrap"
              >
                Withdraw
              </button>
              <button 
                onClick={() => { setTransactionType('TRANSFER'); setIsSendModalOpen(true); }}
                className="bg-[#0B1221] text-white px-3 sm:px-5 lg:px-7 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs lg:text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-black/10 flex items-center gap-1 sm:gap-2 whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" /> Send
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-5 lg:p-10 max-w-[1400px] mx-auto w-full overflow-y-auto custom-scrollbar h-[calc(100vh-5rem)]">
          {currentView === 'dashboard' && MainDashboard()}
          {currentView === 'transactions' && TransactionView()}
          {currentView === 'cards' && CardsView()}
          {currentView === 'profile' && ProfileView()}
          {currentView === 'security' && SecurityView()}
        </div>
      </main>

      {/* MODALS (Rendered as functions to preserve input focus) */}
      {isSendModalOpen && SendMoneyModal()}
      {isAddCardModalOpen && AddCardModal()}
      {isTxDetailOpen && TransactionDetailModal()}
      {isNotificationsOpen && NotificationsModal()}
    </div>
  );
};

export default Dashboard;