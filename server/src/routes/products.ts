import { Router } from 'express';

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    inStock: boolean;
}

const PRODUCTS: Product[] = [
    { id: 1, name: 'Mechanical Keyboard', category: 'Peripherals', price: 149.99, inStock: true },
    { id: 2, name: 'USB-C Hub', category: 'Accessories', price: 49.95, inStock: true },
    { id: 3, name: '4K Monitor', category: 'Displays', price: 599.00, inStock: false },
    { id: 4, name: 'Wireless Mouse', category: 'Peripherals', price: 79.99, inStock: true },
    { id: 5, name: 'Laptop Stand', category: 'Accessories', price: 34.99, inStock: true },
    { id: 6, name: 'Webcam 1080p', category: 'Video', price: 89.99, inStock: false },
    { id: 7, name: 'Noise-Cancelling Headphones', category: 'Audio', price: 249.00, inStock: true },
    { id: 8, name: 'Desk Mat XL', category: 'Accessories', price: 29.99, inStock: true },
    { id: 9, name: 'External SSD 1TB', category: 'Storage', price: 109.99, inStock: true },
    { id: 10, name: 'LED Desk Lamp', category: 'Lighting', price: 44.99, inStock: false },
];

const router = Router();

router.get('/', (_req, res) => {
    res.json(PRODUCTS);
});

router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
    }
    res.json(product);
});

export default router;
