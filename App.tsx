import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal';
import { Product, SaleRecord } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Firebase Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    // Check session storage on mount to allow refresh without re-login
    const sessionAuth = sessionStorage.getItem('pex_auth_session');
    if (sessionAuth === 'active') {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    if (!db) {
      setDbError("O Firebase não foi inicializado corretamente. Verifique sua conexão e as credenciais no arquivo .env.local.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setDbError(null);
    console.log("Iniciando listeners do Firestore...");

    try {
      // 1. Inventory Listener
      const inventoryQuery = query(collection(db, "inventory"));
      const unsubscribeInventory = onSnapshot(inventoryQuery, (snapshot) => {
        const loadedProducts = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Product[];
        setProducts(loadedProducts);
        setIsLoading(false);
      }, (error) => {
        console.error("Erro no listener do inventário:", error);
        setIsLoading(false);
      });

      // 2. Sales Listener
      const salesQuery = query(collection(db, "sales"), orderBy("saleDate", "desc"));
      const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
        const loadedSales = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as SaleRecord[];
        setSalesHistory(loadedSales);
      }, (error) => {
        console.error("Erro no listener de vendas:", error);
      });

      return () => {
        unsubscribeInventory();
        unsubscribeSales();
      };
    } catch (e) {
      console.error("Falha ao configurar listeners:", e);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    sessionStorage.setItem('pex_auth_session', 'active');
    setIsAuthenticated(true);
  };

  if (isChecking) return null; // Or a loading spinner

  return (
    <>
      {!isAuthenticated ? (
        <LoginModal onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard
          products={products}
          salesHistory={salesHistory}
          isLoading={isLoading}
          dbError={dbError}
        />
      )}
    </>
  );
};

export default App;