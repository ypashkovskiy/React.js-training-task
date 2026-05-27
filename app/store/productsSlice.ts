import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, mockProducts } from '../mock/products';

interface ProductsState {
  items: Product[];
}

const initialState: ProductsState = {
  items: mockProducts,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Omit<Product, 'id'>>) => {
      const newProduct = { ...action.payload, id: Date.now().toString() };
      state.items.push(newProduct);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
  },
});

export const { addProduct, updateProduct, deleteProduct } = productsSlice.actions;
export default productsSlice.reducer;