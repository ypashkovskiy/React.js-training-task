import React from 'react';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, productName, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Подтверждение удаления</h3>
        <p>Вы действительно хотите удалить “{productName}”?</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Отмена</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>Удалить</button>
        </div>
      </div>
    </div>
  );
};