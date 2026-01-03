export const products = [
    {
        id: 1,
        name: 'Bomber Jacket',
        price: 12900.00,
        category: 'Jacket',
        fit: 'Relaxed',
        fabric: 'Nylon',
        printType: 'Solid',
        occasion: 'Streetwear',
        inStock: true,
        isNew: true,
        colors: [{ name: 'Black', hex: '#000000' }, { name: 'Olive', hex: '#556B2F' }],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'A classic bomber silhouette reimagined in premium Japanese nylon. Features a relaxed fit, ribbed trims, and our signature monochrome hardware.',
        images: ['/images/products/bomber-1.jpg'],
        details: ['100% Nylon outer', 'Cupro lining', 'Relaxed fit', 'Made in Japan']
    },
    {
        id: 2,
        name: 'Vanta Black Tee',
        price: 4500.00,
        category: 'T-Shirt',
        fit: 'Boxy',
        fabric: 'Organic Cotton',
        printType: 'Solid',
        occasion: 'Everyday',
        inStock: true,
        isNew: true,
        colors: [{ name: 'Black', hex: '#000000' }],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        description: 'The ultimate essential. Crafted from heavyweight organic cotton jersey with a structured drape and dropped shoulders.',
        images: ['/images/products/tee-1.jpg'],
        details: ['Heavyweight 280gsm cotton', 'Boxy fit', 'Preshrunk', 'Ethically sourced']
    },
    {
        id: 3,
        name: 'Graphite Trousers',
        price: 8900.00,
        category: 'Trousers',
        fit: 'Tapered',
        fabric: 'Wool Blend',
        printType: 'Solid',
        occasion: 'Casual',
        inStock: true,
        isNew: false,
        colors: [{ name: 'Grey', hex: '#4A4A4A' }],
        sizes: ['30', '32', '34', '36'],
        description: 'Tailored trousers with a modern tapered leg. Constructed from a wool-blend gabardine that offers durability and drape.',
        images: ['/images/products/trousers-1.jpg'],
        details: ['Wool blend', 'Tapered leg', 'Cropped hem', 'Belt loops']
    },
    {
        id: 4,
        name: 'Eclipse Hoodie',
        price: 6500.00,
        category: 'Hoodie',
        fit: 'Oversized',
        fabric: 'Cotton',
        printType: 'Solid',
        occasion: 'Streetwear',
        inStock: false,
        isNew: true,
        colors: [{ name: 'Black', hex: '#000000' }],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Oversized hoodie in French terry. Deep black dye process ensures color longevity. Features a double-lined hood.',
        images: ['/images/products/hoodie-1.jpg'],
        details: ['100% Cotton French Terry', 'Oversized fit', 'Kangaroo pocket', 'Ribbed cuffs']
    },
    {
        id: 5,
        name: 'Carbon Slip Dress',
        price: 9800.00,
        category: 'Dress',
        fit: 'Regular',
        fabric: 'Silk',
        printType: 'Solid',
        occasion: 'Evening',
        inStock: true,
        isNew: false,
        colors: [{ name: 'Charcoal', hex: '#36454F' }],
        sizes: ['XS', 'S', 'M', 'L'],
        description: 'Minimalist slip dress in silk charcoal. Bias cut for a flattering silhouette that moves with you.',
        images: ['/images/products/dress-1.jpg'],
        details: ['100% Silk', 'Bias cut', 'Midi length', 'Adjustable straps']
    },
    {
        id: 6,
        name: 'Distressed Graphic Tee',
        price: 4800.00,
        category: 'T-Shirt',
        fit: 'Oversized',
        fabric: 'Cotton',
        printType: 'Typography',
        occasion: 'Streetwear',
        inStock: true,
        isNew: true,
        colors: [{ name: 'Off-White', hex: '#F8F8FF' }],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Vintage wash oversized tee featuring abstract typography print. Soft hand feel with vintage aesthetics.',
        images: ['/images/products/tee-graphic-1.jpg'],
        details: ['100% Cotton', 'Vintage Wash', 'Screen print', 'Oversized fit']
    },
    {
        id: 7,
        name: 'Tech Cargo Pants',
        price: 10500.00,
        category: 'Trousers',
        fit: 'Relaxed',
        fabric: 'Nylon',
        printType: 'Solid',
        occasion: 'Streetwear',
        inStock: true,
        isNew: false,
        colors: [{ name: 'Black', hex: '#000000' }, { name: 'Khaki', hex: '#F0E68C' }],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Functional cargo pants with multiple pockets and adjustable cuffs. Made from durable tech nylon.',
        images: ['/images/products/cargo-1.jpg'],
        details: ['Nylon Blend', 'Multiple Pockets', 'Adjustable cuffs', 'Water resistant']
    },
    {
        id: 8,
        name: 'Minimalist Logo Tee',
        price: 3500.00,
        category: 'T-Shirt',
        fit: 'Regular',
        fabric: 'Organic Cotton',
        printType: 'Typography',
        occasion: 'Casual',
        inStock: true,
        isNew: false,
        colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        description: 'Clean and simple tee with small logo print on chest. Perfect for layering.',
        images: ['/images/products/tee-logo-1.jpg'],
        details: ['100% Organic Cotton', 'Regular fit', 'Small chest print', 'Soft touch']
    }
];

export const filters = {
    categories: ['T-Shirt', 'Hoodie', 'Jacket', 'Trousers', 'Dress'],
    fits: ['Regular', 'Oversized', 'Relaxed', 'Boxy', 'Tapered'],
    fabrics: ['Cotton', 'Organic Cotton', 'Nylon', 'Silk', 'Wool Blend'],
    printTypes: ['Solid', 'Typography', 'Illustration'],
    occasions: ['Casual', 'Streetwear', 'Everyday', 'Evening'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
};

export const collections = [
    {
        id: 1,
        title: 'Monochrome Essentials',
        description: 'The foundation of a modern wardrobe. Timeless black and white pieces.',
        href: '/search?q=Essential'
    },
    {
        id: 2,
        title: 'Streetwear Edit',
        description: 'Oversized fits and bold statements for the urban explorer.',
        href: '/search?q=Streetwear'
    },
    {
        id: 3,
        title: 'Premium Knitwear',
        description: 'Luxurious fabrics and textures for refined comfort.',
        href: '/search?q=Knit'
    }
];

export const getProductsByCategory = (category) => {
    return products.filter(product => product.category === category);
};

export const getProductById = (id) => {
    return products.find(product => product.id === parseInt(id));
};

// Admin Mock Data
export const mockOrders = [
    { id: 'ORD-001', customer: 'Aditya Rao', date: '2025-12-30', total: 12900, status: 'Processing', items: 2 },
    { id: 'ORD-002', customer: 'Sarah Smith', date: '2025-12-29', total: 4500, status: 'Shipped', items: 1 },
    { id: 'ORD-003', customer: 'Mike Chen', date: '2025-12-28', total: 24300, status: 'Delivered', items: 3 },
    { id: 'ORD-004', customer: 'Priya Patel', date: '2025-12-28', total: 8900, status: 'Delivered', items: 1 },
    { id: 'ORD-005', customer: 'John Doe', date: '2025-12-27', total: 6500, status: 'Cancelled', items: 1 },
];

export const mockUsers = [
    { id: 'USR-001', name: 'Aditya Rao', email: 'aditya@example.com', role: 'customer', joined: '2025-10-12' },
    { id: 'USR-002', name: 'Admin User', email: 'admin@maybenot.com', role: 'admin', joined: '2025-01-01' },
    { id: 'USR-003', name: 'Sarah Smith', email: 'sarah@example.com', role: 'customer', joined: '2025-11-05' },
    { id: 'USR-004', name: 'Mike Chen', email: 'mike@example.com', role: 'customer', joined: '2025-12-01' },
];

export const heroVariants = [
    {
        id: 1,
        name: 'Default Minimalist',
        description: 'Original hero section with clean typography and model imagery.',
        image: '/hero-default-preview.png'
    },
    {
        id: 2,
        name: 'Creative Revolution',
        description: 'New interactive dark mode hero with 3D tilt effect and neon aesthetic.',
        image: '/hero-creative-preview.png'
    },
    {
        id: 3,
        name: 'Cinematic Video',
        description: 'Immersive full-screen video background showcasing the brand lifestyle.',
        image: '/hero-tshirt-mockup.jpeg'
    },
    {
        id: 4,
        name: 'Modern Streetwear',
        description: 'Clean, dual-button layout with centered typography matching the new brand aesthetic.',
        image: '/hero-modern-placeholder.png'
    },
    {
        id: 5,
        name: 'Designed (Admin Canvas)',
        description: 'Pixel-perfect hero built from the admin design plate (no redeploy).',
        image: '/hero-modern-placeholder.png'
    }
];

// Simple in-memory storage simulation for demo purposes
// In a real app, this would be in a database
export let activeHeroId = 1;
export const setActiveHeroId = (id) => { activeHeroId = id; };
