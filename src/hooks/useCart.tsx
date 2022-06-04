import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
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

  const prevCartRef = useRef<Product[]>();

  useEffect(() => {
    prevCartRef.current = cart;
  })
  const cartPreviousValue = prevCartRef.current ?? cart;

  // bellow to set in localstore whenever it changes 
  useEffect(() => {
    if(cartPreviousValue !== cart){
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    }
  },[ cart, cartPreviousValue])

  const addProduct = async (productId: number) => {
    try {

      const updatedCart = [...cart];
      const productExists = updatedCart.find(product => product.id === productId);

      const stock = await api.get(`stock/${productId}`)
      const currentAmountProductStock = stock.data.amount
      // console.log(stock.data.amount)

      const currentAmount = productExists ? productExists.amount: 0;
      const productAmountRequested = currentAmount + 1;
      // console.log(currentAmount)

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
      }
      setCart(updatedCart)
      // localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart]
      // const newUpdatedCart = updatedCart.filter((product) => (product.id !== productId))

      const productToBeRemovedIndex = updatedCart.findIndex((product) => (product.id === productId))
      
      if(productToBeRemovedIndex >= 0){
        updatedCart.splice(productToBeRemovedIndex, 1)
        setCart(updatedCart)
        // localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      }else{
        throw Error();

      }

      // if(newUpdatedCart === null || undefined){
      //   throw Error();
      //   return;
      // }


    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
        const amountRequested = amount;
        if(amountRequested <= 0){
          return;
        }

        const stock = await api.get(`stock/${productId}`)
        const currentAmountProductStock = stock.data.amount;

        if(amountRequested > currentAmountProductStock){
          // console.log(currentAmountProductStock)
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }

        const updatedCart = [...cart]
        const productExists = updatedCart.find((product) => (product.id === productId))
        if(productExists){
          productExists.amount = amountRequested

          setCart(updatedCart)
          // localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
        }else{
          throw Error();
        }
        // bellow i do this check, because if the user clicks on the (button -minus) it's unnecessary to make the api call
  
        // const currentAmountProductStock = stock.data.amount

        // bellow i am acessing the position 0, because the productExists is an array with only one position always


    } catch {
      toast.error('Erro na alteração de quantidade do produto')
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
