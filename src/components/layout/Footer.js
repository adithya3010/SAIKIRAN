import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-black border-t border-border-secondary pt-20 pb-10 px-4">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                <div className="md:col-span-1">
                    <Link href="/" className="font-outfit text-2xl font-bold tracking-[0.1em] uppercase text-white mb-6 block">
                        KSHRA
                    </Link>
                    <p className="text-grey-400 text-sm leading-relaxed max-w-xs">
                        Elevating simplicity to an art form. We believe in the power of absence.
                    </p>
                </div>

                <div className="flex flex-wrap gap-12 md:gap-24 w-full md:w-auto justify-between">
                    <div className="flex flex-col gap-4">
                        <h4 className="text-white text-sm uppercase tracking-[0.05em] mb-4">Shop</h4>
                        <Link href="/shop/men" className="text-sm text-grey-400 hover:text-white transition-colors">Men</Link>
                        <Link href="/shop/women" className="text-sm text-grey-400 hover:text-white transition-colors">Women</Link>
                        <Link href="/new-arrivals" className="text-sm text-grey-400 hover:text-white transition-colors">New Arrivals</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="text-white text-sm uppercase tracking-[0.05em] mb-4">Support</h4>
                        <Link href="/contact" className="text-sm text-grey-400 hover:text-white transition-colors">Contact</Link>
                        <Link href="/shipping" className="text-sm text-grey-400 hover:text-white transition-colors">Shipping</Link>
                        <Link href="/returns" className="text-sm text-grey-400 hover:text-white transition-colors">Returns</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="text-white text-sm uppercase tracking-[0.05em] mb-4">Legal</h4>
                        <Link href="/privacy" className="text-sm text-grey-400 hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-sm text-grey-400 hover:text-white transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-border-primary mt-16 py-8 px-4 text-center text-xs text-grey-600">
                <p>&copy; {new Date().getFullYear()} KSHRA Inc. All rights reserved.</p>
            </div>
        </footer>
    );
}
