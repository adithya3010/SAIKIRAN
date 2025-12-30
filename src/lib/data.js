export const products = [
    {
        id: 1,
        name: 'Bomber Jacket',
        price: 12900.00,
        category: 'men',
        isNew: true,
        description: 'A classic bomber silhouette reimagined in premium Japanese nylon. Features a relaxed fit, ribbed trims, and our signature monochrome hardware.',
        images: ['/images/products/bomber-1.jpg'],
        details: ['100% Nylon outer', 'Cupro lining', 'Relaxed fit', 'Made in Japan']
    },
    {
        id: 2,
        name: 'Vanta Black Tee',
        price: 4500.00,
        category: 'men',
        isNew: true,
        description: 'The ultimate essential. Crafted from heavyweight organic cotton jersey with a structured drape and dropped shoulders.',
        images: ['/images/products/tee-1.jpg'],
        details: ['Heavyweight 280gsm cotton', 'Boxy fit', 'Preshrunk', 'Ethically sourced']
    },
    {
        id: 3,
        name: 'Graphite Trousers',
        price: 8900.00,
        category: 'men',
        isNew: true,
        description: 'Tailored trousers with a modern tapered leg. Constructed from a wool-blend gabardine that offers durability and drape.',
        images: ['/images/products/trousers-1.jpg'],
        details: ['Wool blend', 'Tapered leg', 'Cropped hem', 'Belt loops']
    },
    {
        id: 4,
        name: 'Eclipse Hoodie',
        price: 6500.00,
        category: 'women',
        isNew: true,
        description: 'Oversized hoodie in French terry. Deep black dye process ensures color longevity. Features a double-lined hood.',
        images: ['/images/products/hoodie-1.jpg'],
        details: ['100% Cotton French Terry', 'Oversized fit', 'Kangaroo pocket', 'Ribbed cuffs']
    },
    {
        id: 5,
        name: 'Carbon Dress',
        price: 9800.00,
        category: 'women',
        isNew: false,
        description: 'Minimalist slip dress in silk charcoal. Bias cut for a flattering silhouette that moves with you.',
        images: ['/images/products/dress-1.jpg'],
        details: ['100% Silk', 'Bias cut', 'Midi length', 'Adjustable straps']
    },
    {
        id: 6,
        name: 'Slate Tote',
        price: 18500.00,
        category: 'accessories',
        isNew: false,
        description: 'Structured leather tote in slate grey. Spacious enough for daily essentials, sleek enough for evening.',
        images: ['/images/products/tote-1.jpg'],
        details: ['Full grain leather', 'Magnetic closure', 'Interior pocket', 'Dust bag included']
    },
    {
        id: 7,
        name: 'Onyx Ring',
        price: 5200.00,
        category: 'accessories',
        isNew: false,
        description: 'Sterling silver signet ring set with a flat onyx stone. Polished finish.',
        images: ['/images/products/ring-1.jpg'],
        details: ['925 Sterling Silver', 'Genuine Onyx', 'Hand polished', 'Available in sizes 6-12']
    },
    {
        id: 8,
        name: 'Midnight Blazer',
        price: 15400.00,
        category: 'women',
        isNew: false,
        description: 'Double-breasted blazer with a sharp silhouette. Power shoulders and a nipped waist create a powerful look.',
        images: ['/images/products/blazer-1.jpg'],
        details: ['Wool blend', 'Double breasted', 'Peak lapels', 'Fully lined']
    }
];

export const collections = [
    { id: 1, title: 'Men\'s Collection', href: '/shop/men', description: 'Essentials for the modern man.' },
    { id: 2, title: 'Women\'s Collection', href: '/shop/women', description: 'Elegant simplicity for her.' },
    { id: 3, title: 'Accessories', href: '/shop/accessories', description: 'The finishing touches.' },
];

export const getProductsByCategory = (category) => {
    return products.filter(product => product.category === category);
};

export const getProductById = (id) => {
    return products.find(product => product.id === parseInt(id));
};
