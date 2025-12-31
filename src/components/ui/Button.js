
export default function Button({ children, variant = 'solid', size = 'md', className = '', ...props }) {
    const baseStyles = 'inline-flex items-center justify-center border border-transparent font-outfit font-medium transition-all duration-300 tracking-[0.05em] uppercase cursor-pointer active:scale-95';

    const variants = {
        solid: 'bg-foreground text-background border-foreground hover:opacity-90',
        outline: 'bg-transparent text-foreground border-border-secondary hover:border-foreground hover:bg-foreground/5',
        ghost: 'bg-transparent text-foreground hover:text-text-muted'
    };

    const sizes = {
        sm: 'h-8 px-4 text-xs',
        md: 'h-12 px-8 text-sm',
        lg: 'h-14 px-12 text-base',
        xl: 'h-16 px-14 text-lg'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
