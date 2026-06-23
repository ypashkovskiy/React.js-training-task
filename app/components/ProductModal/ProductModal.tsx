import React, { useState, useEffect } from 'react';
import { Product } from '../../mock/products';
import styles from './ProductModal.module.css';

// Имитация базы данных стран и городов (вынесите в отдельный файл при необходимости)
const GEO_DATA: Record<string, string[]> = {
  'Россия': ['Москва', 'Санкт-Петербург', 'Казань'],
  'Беларусь': ['Минск', 'Брест', 'Гомель'],
  'Казахстан': ['Алматы', 'Астана', 'Шымкент']
};

interface ProductModalProps {
  isOpen: boolean;
  mode: 'view' | 'edit' | 'create';
  product?: Product | null;
  onClose: () => void;
  // Расширяем тип сохранения под новые поля доставки
  onSave: (product: Omit<Product, 'id'> & { 
    id?: string; 
    email:string; 
    deliveryType: 'none' | 'country' | 'city';
    selectedCountry: string;
    selectedCities: string[];
  }) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, mode, product, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0.00);
  const [isFocused, setIsFocused] = useState(false);
  const [count, setCount] = useState<number>(0);
  const [error, setError] = useState('');
  const [error2, setError2] = useState('');
  const [errorCount, setErrorCount] = useState('');
  const [email, setEmail] = useState('');

  
  // Новые стейты для логики доставки
  const [deliveryType, setDeliveryType] = useState<'none' | 'country' | 'city'>('none');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  useEffect(() => {
    if (product && (mode === 'edit' || mode === 'view')) {
      setName(product.name);
      setPrice(formatCurrency(product.price));
      setCount(product.count);
      setEmail(product.email || "") ;
      // Инициализация полей доставки из пришедшего товара (если они есть)
     
      setDeliveryType(product.deliveryType || 'none');
      setSelectedCountry(product.selectedCountry || '');
      setSelectedCities(product.selectedCities || []);
      setError('');
      setError2('');
      setErrorCount('');
    } else {
      setName('');
      setPrice(0.00);
      setCount(0);
      setEmail('');
      setError('');
      setError2('');
      setErrorCount('');
      setDeliveryType('none');
      setSelectedCountry('');
      setSelectedCities([]);
    }
  }, [product, mode, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  // Обработчик изменения чекбоксов городов
  const handleCityChange = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter(c => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  // При смене страны сбрасываем выбранные города
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedCities([]);
  };

  // Валидация перед сохранением
  const isFormValid = () => {
    if (deliveryType !== 'none') {
      if (!selectedCountry) return false;
      if (selectedCities.length === 0) return false;
    }
    return true;
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    onSave({ 
      id: product?.id, 
      name, 
      email,
      price: parseCurrency(price), 
      count: Number(count),
      deliveryType,
      selectedCountry,
      selectedCities
    });
  };

  const handleNameChange = (e) => {
    const value = e.target.value;

    // 1. Ограничение на максимальную длину (не дает ввести больше 15 символов)
    if (value.length > 15) {
      setError('Длина поля не может превышать 15 символов');
      return;
    }  

    setName(value);
    if (error) setError(""); 
  };

  const handlNameBlur = () => {
  // 2. Валидация на пустоту и пробелы
    if (name.trim() === '') {
      setError('Поле не может быть пустым');
    } else {
      setError('');
    }
  };

   const handleEmailChange = (e) => {
    const value = e.target.value;

    setEmail(value);

   // Очищаем ошибку при вводе
    if (error2) setError2(""); 
   };

  const handleEmailBlur = () => {
    // Простая проверка регулярным выражением на блуре (потере фокуса)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
    if (!emailRegex.test(email)) {
      setError2("Введите корректный email адрес");
    }
  };

 const handleCount = (e) => {
    // Простая проверка регулярным выражением на блуре (потере фокуса)
    const countRegex = /^\d+$/;
   
    const value = e.target.value;
       
     if (value === '') {
      setCount("");
     return;
     
   }
    
   
    if (!countRegex.test(value)) {
      setErrorCount("В поле можно вводить только цифры");
      return;
    }
  
   setCount(parseInt(value));

    if (errorCount) setErrorCount(""); 

  };

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

 const parseCurrency = (str) => {
  // Удаляем всё, кроме цифр, знака минус и точки
  const cleaned = str.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned);
};

  const handlePriceChange = (e) => {
  const value = e.target.value;
  // Сохраняем значение как строку для корректного отображения форматирования
  setPrice(value);
};

const handlePriceFocus = (e) => {
  setIsFocused(true);
  const value = e.target.value;
  setPrice(parseCurrency(value));

  // При фокусе показываем «сырое» значение без форматирования
  // (предполагается, что price уже хранится как строка)
};

const handlePriceBlur = (e) => {
  setIsFocused(false);
  const rawValue = e.target.value;
  const numericValue = parseFloat(rawValue);
  if (!isNaN(numericValue)) {
    // Форматируем значение при потере фокуса
    setPrice(formatCurrency(numericValue));
  } else {
    // Если значение некорректно, сбрасываем или оставляем пустым
    setPrice(0.00);
  }
};

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>{isView ? 'Детали товара' : mode === 'edit' ? 'Редактировать' : 'Добавить товар'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Name:</label>
            <input type="text" value={name} onChange={handleNameChange} onBlur={handlNameBlur} disabled={isView} required
             style={{ borderColor: error ? "red" : "initial" }} />
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>

          <div className={styles.formGroup}>
            <label>Email:</label>
            <input type="email" value={email} onChange={handleEmailChange} onBlur={handleEmailBlur} placeholder="example@mail.com" disabled={isView} 
               style={{ borderColor: error2 ? "red" : "initial" }} />
            {error2 && <p style={{ color: 'red' }}>{error2}</p>}
          </div>
          
          <div className={styles.formGroup}>
             <label>Price:</label>
             <input
             type="text" // Меняем на text, чтобы можно было отображать форматированную строку
             value={price}
             onChange={handlePriceChange}
             onFocus={handlePriceFocus}
             onBlur={handlePriceBlur}
             disabled={isView}
             required
             />
          </div>

          <div className={styles.formGroup}>
            <label>Count:</label>
            <input type="text" value={count} onChange={handleCount} disabled={isView} required 
             style={{ borderColor: errorCount ? "red" : "initial" }}/>
             {errorCount && <p style={{ color: 'red' }}>{errorCount}</p>}

          </div>

          {/* Блок доставки */}
          <div className={styles.formGroup}>
            <label>Delivery:</label>
            <select 
              value={deliveryType} 
              onChange={e => setDeliveryType(e.target.value as any)}
              disabled={isView}
            >
              <option value="none">Пусто</option>
              <option value="country">Страна</option>
              <option value="city" disabled={!selectedCountry}>Город</option>
            </select>
          </div>

          {/* Правые области (условный рендеринг) */}
          {deliveryType !== 'none' && (
            <div className={styles.deliveryContainer}>
              
              {/* Область СТРАН (показывается всегда, когда тип не "none") */}
              {deliveryType === 'country' && (
                <div className={styles.deliveryBox}>
                  <h4>Выберите страну:</h4>
                  {Object.keys(GEO_DATA).map(country => (
                    <label key={country} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="country"
                        value={country}
                        checked={selectedCountry === country}
                        onChange={() => handleCountryChange(country)}
                        disabled={isView}
                      />
                      {country}
                    </label>
                  ))}
                </div>
              )}

              {/* Область ГОРОДОВ (показывается только при типе "city" и если выбрана страна) */}
              {deliveryType === 'city' && selectedCountry && (
                <div className={styles.deliveryBox}>
                  <h4>Города ({selectedCountry}):</h4>
                  {GEO_DATA[selectedCountry].map(city => (
                    <label key={city} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city)}
                        onChange={() => handleCityChange(city)}
                        disabled={isView}
                      />
                      {city}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" onClick={onClose}>Закрыть</button>
            {!isView && (
              <button type="submit" disabled={!isFormValid()}>
                Сохранить
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
