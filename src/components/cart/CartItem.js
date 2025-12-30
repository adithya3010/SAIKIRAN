import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function CartItem({ item }) {
    const { updateQuantity, removeFromCart } = useCart();

    return (
        <div className="flex gap-4 py-6 border-b border-border-secondary last:border-0 relative group">
            <div className="relative w-24 aspect-[3/4] bg-grey-100 flex-shrink-0">
                {item.images && item.images[0] ? (
                    <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-b from-grey-800 to-black" />
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-white font-medium mb-1 font-outfit uppercase tracking-wide text-sm">{item.name}</h3>
                    <p className="text-grey-400 text-sm mb-2">{item.category}</p>
                    <p className="text-white font-semibold">₹{item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border-secondary">
                        <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center text-grey-400 hover:text-white transition-colors"
                        >
                            -
                        </button>
                        <span className="w-8 text-center text-sm text-white">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-grey-400 hover:text-white transition-colors"
                        >
                            +
                        </button>
                    </div>
                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs uppercase tracking-wider text-grey-500 hover:text-red-500 transition-colors underline"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}
