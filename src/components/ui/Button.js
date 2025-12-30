
export default function Button({ children, variant = 'solid', size = 'md', className = '', ...props }) {
    const baseStyles = 'inline-flex items-center justify-center border border-transparent font-outfit font-medium transition-all duration-300 tracking-[0.05em] uppercase cursor-pointer active:scale-95';

    const variants = {
        solid: 'bg-white text-black border-white hover:bg-grey-200 hover:border-grey-200',
        outline: 'bg-transparent text-white border-grey-700 hover:border-white hover:bg-white/5',
        ghost: 'bg-transparent text-white hover:text-grey-300'
    };

    const sizes = {
        sm: 'h-8 px-4 text-xs',
        md: 'h-12 px-8 text-sm',
        lg: 'h-14 px-12 text-base'
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
