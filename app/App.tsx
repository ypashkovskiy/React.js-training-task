import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { addProduct, updateProduct, deleteProduct } from './store/productsSlice';
import { Product } from './mock/products';
import { ProductTable } from './components/ProductTable/ProductTable';
import { ProductModal } from './components/ProductModal/ProductModal';
import { ConfirmModal } from './components/ConfirmModal/ConfirmModal';

export const App: React.FC = () => {
  const products = useSelector((state: RootState) => state.products.items);
  const dispatch = useDispatch();

  // Состояние окон
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const openProductModal = (mode: 'view' | 'edit' | 'create', product?: Product) => {
    setProductModalMode(mode);
    setSelectedProduct(product || null);
    setIsProductModalOpen(true);
  };

  const saveProductHandler = (data: Omit<Product, 'id'> & { id?: string }) => {
    if (productModalMode === 'create') {
      dispatch(addProduct(data));
    } else if (productModalMode === 'edit' && data.id) {
      dispatch(updateProduct(data as Product));
    }
    setIsProductModalOpen(false);
  };

  const openDeleteHandler = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const confirmDeleteHandler = () => {
    if (productToDelete) {
      dispatch(deleteProduct(productToDelete.id));
    }
    setIsDeleteOpen(false);
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1>Учебный каталог товаров</h1>
      
      <ProductTable 
        products={products} 
        onOpenModal={openProductModal} 
        onOpenDelete={openDeleteHandler} 
      />

      <ProductModal 
        isOpen={isProductModalOpen}
        mode={productModalMode}
        product={selectedProduct}
        onClose={() => setIsProductModalOpen(false)}
        onSave={saveProductHandler}
      />

      <ConfirmModal 
        isOpen={isDeleteOpen}
        productName={productToDelete?.name || ''}
        onConfirm={confirmDeleteHandler}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};