import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      // console.log(storagedCart)
      return JSON.parse(storagedCart);
    }
    
    return [];
  });

  // useEffect(() => {
  //   // console.log(cart.length)
  //   if(cart.length !== 0){
  //     // alert('cacau')
  //     localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))

  //   }
  // },[cart])

  const addProduct = async (productId: number) => {
    try {
      // TODO
      // if(cart.length !== 0){


      //   const currentCartStorage = [...cart];
      //   const productExistsStorage = currentCartStorage.find(product => product.id === productId)
        
      //   // if the requested product exists in the cart[localstorage], it will enter in the if below
      //   if(productExistsStorage){
      //     console.log(productExistsStorage)
      //     productExistsStorage.amount += 1
      //     setCart(currentCartStorage)
      //     return
      //   }
        
      // }

      const updatedCart = [...cart];

      const productExists = updatedCart.find(product => product.id === productId);

      const stock = await api.get(`stock/${productId}`)
      const currentAmountProductStock = stock.data.amount
      console.log(stock.data.amount)


      const currentAmount = productExists ? productExists.amount: 0;
      const productAmountRequested = currentAmount + 1;
      console.log(currentAmount)

      if(productAmountRequested > currentAmountProductStock){
        toast.error('Quantidade solicitada fora de estoque');
        return
      }
      
      if(productExists){
        productExists.amount = productAmountRequested
        // setCart(updatedCart)
        // localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))

      }
      else{

        const product = await api.get(`products/${productId}`)
        const newProduct = {
          ...product.data,
          amount: 1
        }

        updatedCart.push(newProduct)

        // productData.data.amount = 1;
        // const currentCart = [...updatedCart, productData.data]
        // setCart(currentCart)
        // localStorage.setItem('@RocketShoes:cart', JSON.stringify(currentCart))
      }

      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      

      // setCart(updatedCart)
      

      // console.log(productExists)
      // if(productExists){
      //   // productExists.amount += 1 ;
      //   // const productAmountRequested = [productExists.amount];

      //   // productAmountRequested > currentAmountProductStock && alert('erro')
      //   // setCart(updatedCart)

      // }else{ // if the product dont exists in cart
        
      //   const product = await api.get(`products/${productId}`)
      //   product.data.amount = 1;
      //   const currentCart = [...updatedCart, product.data]
      //   setCart(currentCart)
      // }

      // console.log(cart)
      


    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productsCart = [...cart]


      const newProductsCart = productsCart.filter((product) => (product.id !== productId))

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newProductsCart))

      setCart(newProductsCart)


    } catch {
      // TODO
      toast.error('Erro na exclusão do produto');

    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
        const amountRequested = amount;
        let stock = null;
        let currentAmountProductStock;

        const productsCart = [...cart]
        const productToBeUpdated = productsCart.filter((product) => (product.id == productId))

        // bellow i do this check, because if the user clicks on the (button -minus) it's unnecessary to make the api call
        if(amountRequested > productToBeUpdated[0].amount){
          stock = await api.get(`stock/${productId}`)
          // alert('called')
        }

        if(stock){
          currentAmountProductStock = stock.data.amount
        }  
        // const currentAmountProductStock = stock.data.amount

        if(amountRequested > currentAmountProductStock){
          // console.log(currentAmountProductStock)
          toast.error('Quantidade solicitada fora de estoque');
          return
          
        }

        // bellow i am acessing the position 0, because the productToBeUpdated is an array with only one position always
        productToBeUpdated[0].amount = amountRequested
        // console.log(productToBeUpdated)

        // console.log(productsCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(productsCart))
        setCart(productsCart)

        // console.log(productId, amount)
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
