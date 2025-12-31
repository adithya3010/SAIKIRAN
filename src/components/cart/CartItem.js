import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function CartItem({ item }) {
    const { updateQuantity, removeFromCart } = useCart();

    return (
        <div className="flex gap-4 py-6 border-b border-border-secondary last:border-0 relative group">
            <div className="relative w-24 aspect-[3/4] bg-bg-secondary flex-shrink-0">
                {item.images && item.images[0] ? (
                    <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-b from-bg-secondary to-bg-tertiary" />
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-foreground font-medium mb-1 font-outfit uppercase tracking-wide text-sm">{item.name}</h3>
                    <p className="text-text-muted text-sm mb-2">{item.category}</p>
                    {/* Size and Color Display */}
                    <div className="flex gap-3 text-xs text-text-muted mb-2">
                        {item.selectedSize && <span>Size: <span className="text-foreground">{item.selectedSize}</span></span>}
                        {item.selectedColor && (
                            <div className="flex items-center gap-1">
                                <span>Color:</span>
                                <span className="w-3 h-3 rounded-full border border-border-secondary" style={{ backgroundColor: item.selectedColor.hex }}></span>
                                <span className="text-foreground">{item.selectedColor.name}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-foreground font-semibold">₹{item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center border border-border-secondary">
                        <button
                            onClick={() => updateQuantity(item.cartId, -1)}
                            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-foreground transition-colors"
                        >
                            -
                        </button>
                        <span className="w-8 text-center text-sm text-foreground">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.cartId, 1)}
                            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-foreground transition-colors"
                        >
                            +
                        </button>
                    </div>
                    <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-xs uppercase tracking-wider text-text-muted hover:text-red-500 transition-colors underline"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}
