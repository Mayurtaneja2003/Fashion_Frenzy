import React, {useContext, useRef, useState }from 'react'
import './navbar.css'
import logo from './img/logo.png'
import cart_icon from '../assets/cart_icon.png'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../context/Shop-context'
import nav_dropdown from '../assets/nav_dropdown.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardList } from '@fortawesome/free-solid-svg-icons'

const Navbar = () => {

  const getMenuFromPath = (pathname) => {
    if (pathname === '/' || pathname === '/shop') return 'shop';
    if (pathname.startsWith('/mens')) return 'mens';
    if (pathname.startsWith('/women')) return 'women';
    if (pathname.startsWith('/kids')) return 'kids';
    if (pathname.startsWith('/order-history')) return 'orders';
    if (pathname.startsWith('/cart')) return 'cart';
    return 'shop';
  };
  
  const [menu, setMenu] = useState(getMenuFromPath(window.location.pathname));
  const { getTotalCartItems, cartItems, getDefaultCart, setCartItems } = useContext(ShopContext);
  const menuRef= useRef();
  const dropdown_toggle=(e)=>{
  menuRef.current.classList.toggle('nav-menu-visible');
  e.target.classList.toggle('open');
  }  
  
  const logout = () => {
    localStorage.removeItem('auth-token');
    setCartItems(getDefaultCart()); // Reset cart to default
    window.location.replace('/');
  };
   
  return (
    <div className='navbar'>
      <div className="nav-logo">
        <img src={logo} alt="img" />
      </div>
      <img className='nav-dropdown' onClick={dropdown_toggle} src={nav_dropdown} alt=""/>

      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => { setMenu("shop") }}>
          <Link style={{ textDecoration: 'none' }} to='/'>Shop</Link>
          {menu === "shop" ? <hr /> : null}
        </li>
        <li onClick={() => { setMenu("mens") }}>
          <Link style={{textDecoration: 'none'}} to='/mens'>Men</Link>
          {menu === "mens" ? <hr /> : null}
        </li>
        <li onClick={() => { setMenu("women") }}>
          <Link style={{textDecoration: 'none'}} to='/women'>Women</Link>
          {menu === "women" ? <hr /> : null}
        </li>
        <li onClick={() => { setMenu("kids") }}>
          <Link style={{textDecoration: 'none'}} to='/kids'>Kids</Link>
          {menu === "kids" ? <hr /> : null}
        </li>
      </ul>
      <div className="nav-login-cart">
  <div
    className="nav-orders-container"
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
    onClick={() => setMenu("orders")}
  >
    <Link
      to='/order-history'
      className="nav-orders"
      tabIndex={0}
      style={{ textDecoration: 'none' }}
    >
      <FontAwesomeIcon icon={faClipboardList} className="orders-icon" />
      Orders
    </Link>
    {menu === "orders" && <hr />}
  </div>
  {localStorage.getItem('auth-token')
    ? <button onClick={logout}> Logout </button>
    : <Link to='/login'><button>Login</button></Link>
  }
  <div
    className="nav-cart-container"
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
    onClick={() => setMenu("cart")}
  >
    <Link
      to='/cart'
      style={{ position: 'relative', display: 'inline-block', textDecoration: 'none' }}
    >
      <img src={cart_icon} alt="" />
      <div className="nav-cart-count">{getTotalCartItems()}</div>
    </Link>
    {menu === "cart" && <hr />}
  </div>
</div>

    </div>
  )
}


export default Navbar;

