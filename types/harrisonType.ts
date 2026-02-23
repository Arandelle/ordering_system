export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'inasal' | 'bbq' | 'combo' | 'drinks';
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}