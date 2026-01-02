"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse cart data", error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prev => {
            // Create a unique ID for this specific variant combination
            const uniqueId = `${product.id}-${product.selectedSize}-${product.selectedColor?.name || 'default'}`;

            // Check if this specific variant is already in cart
            const existing = prev.find(item => item.cartId === uniqueId);

            if (existing) {
                return prev.map(item =>
                    item.cartId === uniqueId
                        ? { ...item, quantity: item.quantity + product.quantity } // Add new quantity to existing
                        : item
                );
            }

            // Add new item with the unique cartId
            return [...prev, { ...product, cartId: uniqueId }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (cartId) => {
        setCartItems(prev => prev.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, delta) => {
        setCartItems(prev => prev.map(item => {
            if (item.cartId === cartId) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            isCartOpen,
            toggleCart,
            cartTotal,
            cartCount,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
