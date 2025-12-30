"use client";
import Button from '../ui/Button';
import { useCart } from '@/context/CartContext';

export default function AddToCart({ product }) {
    const { addToCart } = useCart();

    return (
        <div className="flex flex-col gap-6 mb-12">
            <Button
                variant="solid"
                size="lg"
                className="w-full md:w-auto"
                onClick={() => addToCart(product)}
            >
                Add to Cart
            </Button>
            <Button variant="outline" size="lg" className="w-full md:w-auto">
                Save for Later
            </Button>
        </div>
    );
}
