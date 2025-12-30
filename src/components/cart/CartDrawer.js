"use client";
import { useCart } from "@/context/CartContext";
import CartItem from "./CartItem";
import Button from "../ui/Button";
import { useEffect, useRef } from "react";

export default function CartDrawer() {
    const { isCartOpen, toggleCart, cartItems, cartTotal } = useCart();
    const drawerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                if (isCartOpen) toggleCart();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isCartOpen, toggleCart]);

    return (
        <div className={`fixed inset-0 z-[200] transition-visibility duration-500 ${isCartOpen ? 'visible' : 'invisible'}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`absolute top-0 right-0 h-full w-full md:w-[450px] bg-black border-l border-border-secondary flex flex-col transform transition-transform duration-500 ease-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="p-6 border-b border-border-secondary flex justify-between items-center bg-black z-10">
                    <h2 className="text-xl font-outfit uppercase tracking-widest text-white">Your Cart ({cartItems.length})</h2>
                    <button onClick={toggleCart} className="text-grey-400 hover:text-white transition-colors">
                        Close
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <p className="text-grey-500 mb-6">Your shopping bag is empty.</p>
                            <Button variant="outline" onClick={toggleCart}>
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {cartItems.map(item => (
                                <CartItem key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-6 border-t border-border-secondary bg-black z-10">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-grey-400 uppercase tracking-wider text-sm">Subtotal</span>
                            <span className="text-xl font-medium text-white">₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-grey-500 mb-6 text-center">Shipping and taxes calculated at checkout.</p>
                        <Button variant="solid" className="w-full">
                            Checkout
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
