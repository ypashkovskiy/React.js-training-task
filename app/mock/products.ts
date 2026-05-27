export interface Product {
  id: string;
  name: string;
  price: number;
  count: number;
}

export const mockProducts: Product[] = [
  { id: '1', name: 'Товар 1', price: 12500.50, count: 5 },
  { id: '2', name: 'Товар 2', price: 4300.00, count: 3},
  { id: '3', name: 'Абсолютно новый товар', price: 99990.00, count: 12},
];