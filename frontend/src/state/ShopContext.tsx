import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { message } from "antd";
import type { CartItem, ChatMessage, ChatResponse, Product } from "../types";

type ShopState = {
  compareIds: string[];
  cartItems: CartItem[];
  drawerOpen: boolean;
  drawerSeed: string;
  conversationId?: string;
  messages: ChatMessage[];
  lastChat?: ChatResponse;
  addToCompare: (product: Product) => void;
  removeFromCompare: (id: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  changeQuantity: (id: string, quantity: number) => void;
  askAi: (seed: string) => void;
  setDrawerOpen: (open: boolean) => void;
  pushMessage: (msg: ChatMessage) => void;
  setLastChat: (response?: ChatResponse) => void;
  clearCart: () => void;
};

const ShopContext = createContext<ShopState | null>(null);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSeed, setDrawerSeed] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: "告诉我预算、用途和偏好，我会按真实商品参数给你推荐。" }
  ]);
  const [lastChat, setLastChatState] = useState<ChatResponse>();

  const value = useMemo<ShopState>(() => ({
    compareIds,
    cartItems,
    drawerOpen,
    drawerSeed,
    conversationId,
    messages,
    lastChat,
    addToCompare(product) {
      setCompareIds((current) => {
        if (current.includes(product.id)) {
          message.info("商品已在对比栏");
          return current;
        }
        if (current.length >= 3) {
          message.warning("最多同时对比3个商品");
          return current;
        }
        message.success("已加入对比");
        return [...current, product.id];
      });
    },
    removeFromCompare(id) {
      setCompareIds((current) => current.filter((item) => item !== id));
    },
    addToCart(product) {
      setCartItems((current) => {
        const existing = current.find((item) => item.productId === product.id);
        message.success("已加入购物车");
        if (existing) {
          return current.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        }
        return [...current, { productId: product.id, quantity: 1 }];
      });
    },
    removeFromCart(id) {
      setCartItems((current) => current.filter((item) => item.productId !== id));
    },
    changeQuantity(id, quantity) {
      setCartItems((current) => current.map((item) => (item.productId === id ? { ...item, quantity } : item)));
    },
    askAi(seed) {
      setDrawerSeed(seed);
      setDrawerOpen(true);
    },
    setDrawerOpen,
    pushMessage(msg) {
      setMessages((current) => [...current, msg]);
    },
    setLastChat(response) {
      setLastChatState(response);
      if (response?.conversation_id) setConversationId(response.conversation_id);
    },
    clearCart() {
      setCartItems([]);
    }
  }), [cartItems, compareIds, conversationId, drawerOpen, drawerSeed, lastChat, messages]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
};
