"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import Image from 'next/image';

const steps = [
    { id: 1, name: 'Address' },
    { id: 2, name: 'Payment' },
    { id: 3, name: 'Review' },
];

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cartItems, cartTotal, clearCart } = useCart();

    const [currentStep, setCurrentStep] = useState(1);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/checkout");
        } else if (status === "authenticated") {
            if (cartItems.length === 0) {
                router.push("/shop");
                return;
            }
            fetchAddresses();
        }
    }, [status, router, cartItems.length]);

    const fetchAddresses = async () => {
        try {
            const res = await fetch("/api/user/addresses");
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
                // Auto-select default address
                const defaultAddr = data.find(a => a.isDefault);
                if (defaultAddr) setSelectedAddress(defaultAddr._id);
                else if (data.length > 0) setSelectedAddress(data[0]._id);
            }
        } catch (error) {
            console.error("Failed to fetch addresses");
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        setProcessing(true);
        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    selectedSize: item.selectedSize,
                    selectedColor: item.selectedColor,
                    image: item.image || item.images?.[0] || item.colors?.[0]?.images?.[0]
                })),
                shippingAddress: addresses.find(a => a._id === selectedAddress),
                paymentMethod: paymentMethod,
                itemsPrice: cartTotal,
                taxPrice: 0, // Calculate properly if needed
                shippingPrice: 0, // Free shipping
                totalPrice: cartTotal,
            };

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (!res.ok) throw new Error("Failed to place order");

            const data = await res.json();
            clearCart();
            router.push(`/account/orders/${data._id}`); // Redirect to order details
        } catch (error) {
            console.error("Order failed", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="min-h-screen bg-background text-foreground pt-32 flex justify-center">
                <div className="animate-pulse">Loading Checkout...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 px-4 md:px-8 pb-20">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Steps Indicator */}
                    <div className="flex items-center justify-between mb-8">
                        {steps.map((step, idx) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 
                                    ${currentStep >= step.id ? 'bg-foreground text-background border-foreground' : 'text-text-muted border-text-muted'}
                                `}>
                                    {step.id}
                                </div>
                                <span className={`ml-2 text-sm font-bold uppercase tracking-wider ${currentStep >= step.id ? 'text-foreground' : 'text-text-muted'}`}>
                                    {step.name}
                                </span>
                                {idx < steps.length - 1 && (
                                    <div className="w-12 h-0.5 mx-4 bg-border-primary"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Address */}
                    {currentStep === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-bold mb-6">Select Shipping Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((addr) => (
                                    <div
                                        key={addr._id}
                                        onClick={() => setSelectedAddress(addr._id)}
                                        className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${selectedAddress === addr._id ? 'border-foreground bg-bg-secondary' : 'border-border-primary hover:border-foreground/50'}`}
                                    >
                                        <div className="font-bold mb-1">{addr.firstName} {addr.lastName}</div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>{addr.address}</p>
                                            <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                                            <p>{addr.country}</p>
                                            <p>Phone: {addr.phone}</p>
                                        </div>
                                    </div>
                                ))}
                                {/* Add New Address Button */}
                                <button
                                    onClick={() => router.push('/account/addresses?returnTo=/checkout')}
                                    className="p-6 rounded-lg border-2 border-dashed border-border-primary flex items-center justify-center hover:bg-bg-secondary transition-colors"
                                >
                                    <span className="font-bold">+ Manage / Add Address</span>
                                </button>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <Button
                                    variant="solid"
                                    disabled={!selectedAddress}
                                    onClick={() => setCurrentStep(2)}
                                >
                                    Continue to Payment
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Payment */}
                    {currentStep === 2 && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-bold mb-6">Select Payment Method</h2>
                            <div className="space-y-4">
                                {['Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery'].map((method) => (
                                    <label key={method} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === method ? 'border-foreground bg-bg-secondary' : 'border-border-primary hover:bg-bg-tertiary'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method}
                                            checked={paymentMethod === method}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-5 h-5 accent-foreground mr-4"
                                        />
                                        <span className="font-medium">{method}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-8 flex justify-between">
                                <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                                <Button
                                    variant="solid"
                                    disabled={!paymentMethod}
                                    onClick={() => setCurrentStep(3)}
                                >
                                    Review Order
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {currentStep === 3 && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-bold mb-6">Review Order</h2>
                            <div className="bg-bg-secondary rounded-lg p-6 space-y-4 mb-6">
                                <h3 className="font-bold border-b border-border-primary pb-2">Shipping To:</h3>
                                {selectedAddress && (() => {
                                    const addr = addresses.find(a => a._id === selectedAddress);
                                    return (
                                        <div className="text-sm">
                                            <p className="font-bold">{addr.firstName} {addr.lastName}</p>
                                            <p>{addr.address}, {addr.city}</p>
                                            <p>{addr.state}, {addr.postalCode}</p>
                                            <p>{addr.country}</p>
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="bg-bg-secondary rounded-lg p-6 space-y-4 mb-6">
                                <h3 className="font-bold border-b border-border-primary pb-2">Payment Method:</h3>
                                <p className="text-sm">{paymentMethod}</p>
                            </div>

                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.cartId} className="flex gap-4 border-b border-border-primary pb-4">
                                        <div className="relative w-20 h-24 bg-bg-tertiary rounded overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.image || item.colors?.[0]?.images?.[0] || item.images?.[0]}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold">{item.name}</h4>
                                            <p className="text-sm text-text-muted">Size: {item.selectedSize} | Color: {item.selectedColor?.name}</p>
                                            <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="font-bold">₹{item.price * item.quantity}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-between">
                                <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                                <Button
                                    variant="solid"
                                    onClick={handlePlaceOrder}
                                    disabled={processing}
                                >
                                    {processing ? "Allocating Stock..." : "Place Order"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Summary */}
                <div className="lg:col-span-4">
                    <div className="bg-bg-secondary p-6 rounded-lg sticky top-24 border border-border-primary">
                        <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-text-muted">Subtotal</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Shipping</span>
                                <span className="text-green-500">Free</span>
                            </div>
                            <div className="border-t border-border-primary pt-4 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{cartTotal}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
