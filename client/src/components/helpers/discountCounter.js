const discountCounter = (price, salePrice) => {
    const discount = ((price - salePrice) / price) * 100;
    return Math.round(discount);
  };

  export default discountCounter;