const formatToK = (number) => {
  if (number >= 1000) {
    return Math.floor(number / 1000) + "k+";
  }
  return number.toString();
};

export default formatToK