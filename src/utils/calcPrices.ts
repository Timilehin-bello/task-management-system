const addDecimals = (num: number): string => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

export const calcPrices = (
  orderItems: any[]
): {
  itemsPrice: string;
  shippingPrice: string;
  taxPrice: string;
  totalPrice: string;
} => {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + (item.product.price * 100 * item.quantity) / 100,
    0
  );

  const shippingPrice = itemsPrice > 100 ? 0 : 10;

  const taxPrice = 0.15 * itemsPrice;

  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return {
    itemsPrice: addDecimals(itemsPrice),
    shippingPrice: addDecimals(shippingPrice),
    taxPrice: addDecimals(taxPrice),
    totalPrice: addDecimals(totalPrice),
  };
};
