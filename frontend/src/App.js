import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css';
import Shop from './pages/shop';
import Shopcategory from './pages/ShopCategory';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Loginsignup from './pages/LoginSignUp';
import Navbar from './components/navbar/navbar';
import { Footer } from './components/Footer/Footer';
import men_banner from './components/assets/banner_mens.png';
import women_banner from './components/assets/banner_women.png';
import kid_banner from './components/assets/banner_kids.png';
import { ShopContext, ShopContextProvider } from './context/Shop-context';
import Contact from './components/Contact/Contact';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './components/OrderHistory/OrderHistory';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <ShopContextProvider>
                    <Navbar />
                    <Routes>
                        <Route path='/' element={<Shop />} />
                        <Route path='/mens' element={<Shopcategory banner={men_banner} category="men" />} />
                        <Route path='/women' element={<Shopcategory banner={women_banner} category="women" />} />
                        <Route path='/kids' element={<Shopcategory banner={kid_banner} category="kid" />} />
                        <Route path="/product/:productId" element={<Product />} />
                        <Route path='/cart' element={<Cart />} />
                        <Route path='/login' element={<Loginsignup />} />
                        <Route path='/checkout' element={<Checkout />} />
                        <Route path='/order-success' element={<OrderSuccess />} />
                        <Route path='/order-history' element={<OrderHistory />} />
                    </Routes>
                    <Footer />
                </ShopContextProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
