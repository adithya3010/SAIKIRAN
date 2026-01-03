"use client";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";

export default function AddressesPage() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        phone: "",
        isDefault: false
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            const callbackUrl = encodeURIComponent(window.location.href);
            router.push(`/login?callbackUrl=${callbackUrl}`);
        } else if (status === "authenticated") {
            fetchAddresses();
        }
    }, [status, router]);

    const fetchAddresses = async () => {
        try {
            const res = await fetch("/api/user/addresses");
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error("Failed to fetch addresses");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const method = editingId ? "PUT" : "POST";
            const body = editingId ? { ...formData, _id: editingId } : formData;

            const res = await fetch("/api/user/addresses", {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to save address");

            setAddresses(data);
            setShowForm(false);
            setEditingId(null);
            setFormData({
                firstName: "",
                lastName: "",
                address: "",
                city: "",
                state: "",
                postalCode: "",
                country: "India",
                phone: "",
                isDefault: false
            });

            // Check for returnTo param
            const returnTo = searchParams.get("returnTo");
            if (returnTo) {
                router.push(returnTo);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (addr) => {
        setFormData({
            firstName: addr.firstName,
            lastName: addr.lastName,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            country: addr.country,
            phone: addr.phone,
            isDefault: addr.isDefault
        });
        setEditingId(addr._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            firstName: "",
            lastName: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India",
            phone: "",
            isDefault: false
        });
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this address?")) return;

        try {
            const res = await fetch(`/api/user/addresses?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error("Failed to delete address");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground pt-32 flex justify-center">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 md:pt-32 px-4 md:px-8 pb-20">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Addresses</h1>
                        <p className="text-muted-foreground">Manage your shipping addresses</p>
                    </div>
                    {!showForm && (
                        <Button onClick={() => setShowForm(true)} variant="solid">
                            + Add New Address
                        </Button>
                    )}
                </div>

                {showForm && (
                    <div className="bg-bg-secondary border border-border-primary p-6 rounded-lg animate-fade-in">
                        <h2 className="text-xl font-bold mb-6">{editingId ? "Edit Address" : "Add New Address"}</h2>
                        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="bg-bg-tertiary border border-border-secondary p-3 rounded w-full outline-none focus:border-foreground transition-colors"
                                    required
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="bg-bg-tertiary border border-border-secondary p-3 rounded w-full outline-none focus:border-foreground transition-colors"
                                    required
                                />
                            </div>
                            <input
                                type="text"
                                name="address"
                                placeholder="Address / Street"
                                value={formData.address}
                                onChange={handleChange}
                                className="bg-bg-tertiary border border-border-secondary p-3 rounded w-full outline-none focus:border-foreground transition-colors"
                                required
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="bg-bg-tertiary border border-border-secondary p-3 rounded w-full outline-none focus:border-foreground transition-colors"
                                    required
                                />
                                <input
                                    type="text"
                                    name="postalCode"
                                    placeholder="Postal Code"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    className="bg-bg-tertiary border border-border-secondary p-3 rounded w-full outline-none focus:border-foreground transition-colors"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="bg-bg-tertiary border border-border-secondary p-3 rounded w-full outline-none focus:border-foreground transition-colors"
                                    required
                                />
                                <input
                                    type="text"
                                    name="country"
                                    placeholder="Country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="bg-bg-tertiary border border-border-secondary p-3 rounded w-full outline-none focus:border-foreground transition-colors"
                                    readOnly // Simplification for now
                                />
                            </div>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="bg-bg-tertiary border border-border-secondary p-3 rounded w-full outline-none focus:border-foreground transition-colors"
                                required
                            />

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={formData.isDefault}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-foreground"
                                />
                                <span className="text-sm">Set as default address</span>
                            </label>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" variant="solid" disabled={submitting}>
                                    {submitting ? "Saving..." : "Save Address"}
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.length === 0 && !showForm && (
                        <div className="text-text-muted col-span-full text-center py-10 border border-dashed border-border-primary rounded-lg">
                            No addresses found. Add one to get started.
                        </div>
                    )}

                    {addresses.map((addr) => (
                        <div key={addr._id} className="bg-bg-secondary border border-border-primary p-6 rounded-lg relative group">
                            {addr.isDefault && (
                                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest bg-foreground text-background px-2 py-1 rounded">
                                    Default
                                </span>
                            )}
                            <h3 className="font-bold text-lg mb-1">{addr.firstName} {addr.lastName}</h3>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>{addr.address}</p>
                                <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                                <p>{addr.country}</p>
                                <p className="pt-2">Phone: {addr.phone}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-border-primary flex gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDelete(addr._id)}
                                    className="text-xs text-red-500 hover:underline uppercase tracking-wider font-bold"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => handleEdit(addr)}
                                    className="text-xs text-blue-500 hover:underline uppercase tracking-wider font-bold"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
