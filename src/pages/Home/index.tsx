import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();
  const [myCart, setMyCart] = useState<CartItemsAmount>({})
  
    const cartItemsAmount = cart.reduce((pastProduct, currentProduct) => {
          // const { id } = currentProduct;
          return { ...pastProduct, 
          [currentProduct.id]: currentProduct.amount
        };

      }, {} as CartItemsAmount);
    

  // setMyCart(cartItemsAmount)

  // const cartItemsAmount = cart.reduce((sumAmount, product) => {
  //   // TODO
  // }, {} as CartItemsAmount)

  useEffect(()=> {

    // const cartItemsAmount = cart.reduce((pastProduct, currentProduct) => {
    //       // const { id } = currentProduct;
    //   return { ...pastProduct, 
    //   [currentProduct.id]: currentProduct.amount
    // };

    // }, {} as CartItemsAmount);

    setMyCart(cartItemsAmount)

  },[cart])

  // const [myCart, setMyCart] = useState<CartItemsAmount>(() => {

  //   if(cart.length !== 0){

  //       return cart.reduce((pastProduct, currentProduct) => {
  //         // const { id } = currentProduct;
  //         return { ...pastProduct, 
  //         [currentProduct.id]: currentProduct.amount
  //       };

  //     }, {});

  //   }

  //   return {}

  // });

  console.log(myCart)

  // let initialObjectProducts = {}

  // const productsKeyAmount = cart.reduce((pastProduct, currentProduct) => {
  //   // const { id } = currentProduct;
  //   return { ...pastProduct, 
  //     [currentProduct.id]: currentProduct.amount
  //   };

  // }, myCart);



  // console.log(productsKeyAmount)

  // setMyCart(productsKeyAmount)

  useEffect(() => {
    async function loadProducts() {
      // TODO

      // let response 

      await api.get('/products').then(response => setProducts(response.data));

      // await api.get('/products').then(response => console.log(response.data));

      // setProducts(response);
      // console.log(response.data);
    }

    loadProducts();
  }, []);

  async function handleAddProduct(id: number) {
    // let key = id

    await addProduct(id)
    // setMyCart(cart)
    
    // TODO
    // const list = [...myCart, id: '1']
    // let a = [...myCart];
    // setMyCart([...myCart,  key: 0])


  }

  return (

    <ProductList>
      {
        products.map((product => {
            return (

                <li key={product.id}>

                  <img src={product.image} alt="Tênis de Caminhada Leve Confortável" />
                  <strong>{product.title}</strong>
                  <span>{formatPrice(product.price)}</span>
                  <button
                    type="button"
                    data-testid="add-product-button"
                    onClick={() => handleAddProduct(product.id)}
                  >
                    <div data-testid="cart-product-quantity">
                      <MdAddShoppingCart size={16} color="#FFF" />
                      {cartItemsAmount[product.id] || 0}
                    </div>

                    <span>ADICIONAR AO CARRINHO</span>
                  </button>

                </li>
            )
        }))
      }

    </ProductList>

  );
};

export default Home;
