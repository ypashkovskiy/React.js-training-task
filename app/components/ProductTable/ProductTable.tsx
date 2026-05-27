import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../../mock/products';
import styles from './ProductTable.module.css';

interface ProductTableProps {
  products: Product[];
  onOpenModal: (mode: 'view' | 'edit' | 'create', product?: Product) => void;
  onOpenDelete: (product: Product) => void;
}

type SortKey = 'name' | 'price' | 'count';
type SortOrder = 'asc' | 'desc' | null;

// Локальное форматирование валюты (Числа -> Строка с разделителями)
const formatCurrency = (value: number) => {
 return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

export const ProductTable: React.FC<ProductTableProps> = ({ products, onOpenModal, onOpenDelete }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Синхронизация поиска с URL-параметром `search`
  const searchQuery = searchParams.get('search') || '';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ search: val });
    } else {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else if (sortOrder === 'desc') { setSortKey(null); setSortOrder(null); }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return '↕';
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  // 1. Фильтрация без учета регистра
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Сортировка данных
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortKey || !sortOrder) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });

  return (
    <div>
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Поиск по наименованию..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <button className={styles.addBtn} onClick={() => onOpenModal('create')}>Add new</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Наименование товара (Count) {renderSortIcon('name')}</th>
            <th onClick={() => handleSort('price')}>Цена {renderSortIcon('price')}</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map(product => (
            <tr key={product.id}>
              <td>
                <a href="#" className={styles.link} onClick={(e) => { e.preventDefault(); onOpenModal('view', product); }}> 
                {product.name} 
                </a> ({product.count})
              </td>
              {/* Вывод отформатированной сущности */}
              <td>{formatCurrency(product.price)}</td>
              <td>
                <button className={styles.actionBtn} onClick={() => onOpenModal('edit', product)}>Edit</button>
                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => onOpenDelete(product)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};