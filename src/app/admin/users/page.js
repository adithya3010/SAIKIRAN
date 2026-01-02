"use client";
import React, { useState, useEffect } from 'react';

export default function AdminUsersPage() {
    const [filterSearch, setFilterSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                // Determine API endpoint with optional search param
                const endpoint = filterSearch
                    ? `/api/admin/users?search=${encodeURIComponent(filterSearch)}`
                    : '/api/admin/users';

                const res = await fetch(endpoint);
                const data = await res.json();
                if (data.success) {
                    setUsers(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filterSearch]);

    return (
        <div className="p-8 md:p-12 pb-20">
            <div className="mb-10">
                <h1 className="text-4xl font-outfit font-bold uppercase mb-2 text-foreground">Customers</h1>
                <p className="text-text-muted">Manage registered users.</p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                    />
                    <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-grey-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
            </div>

            {/* Table */}
            <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-grey-400 uppercase tracking-wider text-xs font-bold">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-grey-500">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-grey-500">No users found.</td></tr>
                            ) : users.map(user => (
                                <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        {user.name}
                                    </td>
                                    <td className="p-4 text-grey-400">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${user.role === 'admin'
                                            ? 'border-purple-500/30 text-purple-400 bg-purple-500/10'
                                            : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-grey-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <button className="text-white hover:text-grey-300 underline text-xs uppercase tracking-widest pl-2">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
