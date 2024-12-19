import { AiOutlineLoading } from "react-icons/ai";
import { RiDeleteBin6Line } from "react-icons/ri";
import { ImFileEmpty } from "react-icons/im";
import { useDispatch, useSelector } from "react-redux";
import { checkout } from "../../../store/orderSlice/orderSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Cart = ({
  isCartOpen,
  setIsCartOpen,
  cartRef,
  cart,
  selectedItemsFK,
  setSelectedItems,
  setSelectedTotal,
  handleSelectItem,
  handleRemoveFromCart,
  handleUpdateQuantity,
  isQuantityUpdateting,
  updatingItemId,
  inputValues,
  setInputValues,
  handleKeyDown,
  isRemoving,
  removingItemId,
  selectedTotal,
}) => {
  const navigate = useNavigate();
  const [stockMessage, setStockMessage] = useState("");
  const [alertShow, setAlertShow] = useState(false);

  const handleCheckout = () => {
    navigate("/shop/checkout", {
      state: {
        selectedItems: selectedItemsFK,
      },
    });
    setIsCartOpen(false);
    setSelectedItems({});
    setSelectedTotal(0);
    setInputValues({});
  };

  return (
    <div>
      {isCartOpen && (
        <div
          ref={cartRef}
          className="bg-white border border-primary-light p-4 shadow-lg w-full md:w-1/2 xl:w-1/3 fixed top-[65px] md:right-4 z-10"
        >
          <h2 className="text-xl font-semibold mb-4 border-b pb-3">
            Your Cart
          </h2>
          <div className="cart-items-container flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
            {cart?.items?.length > 0 ? (
              cart?.items?.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItemsFK[item.product._id] || false}
                      onChange={() =>
                        handleSelectItem(item.product._id, item.quantity)
                      }
                      className="mr-2"
                    />
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-16 h-16 object-contain border"
                      />
                      <div className="flex flex-col">
                        <h4 className="font-semibold">{item.product.title}</h4>
                        <span>
                          Rp. {item.product.salePrice.toLocaleString()}
                        </span>
                        <span className="text-sm">
                          Stock: {item.product.stock}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (item.quantity === 1) {
                            handleRemoveFromCart(item.product._id);
                          } else {
                            setSelectedItems({});
                            setSelectedTotal(0);
                            handleUpdateQuantity(
                              item.product._id,
                              item.quantity - 1
                            );
                          }
                        }}
                        className="px-2 py-1 bg-gray-200"
                        disabled={isQuantityUpdateting}
                      >
                        -
                      </button>
                      {isQuantityUpdateting &&
                      updatingItemId === item?.product._id ? (
                        <span className="animate-spin text-xl mx-5">
                          <AiOutlineLoading />
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={inputValues[item.product._id] || item.quantity}
                          className="w-[60px] py-1 text-center border rounded focus:outline-none"
                          onChange={(e) => {
                            setSelectedItems({});
                            setSelectedTotal(0);
                            let newValue = e.target.value;

                            if (/^\d*$/.test(newValue)) {
                              const numericValue = newValue;

                              if (numericValue > item.product.stock) {
                                setStockMessage(
                                  `You can't order more than stock (${item.product.stock})`
                                );
                                setAlertShow(true);
                                setInputValues({});
                                return;
                              }

                              setInputValues((prev) => ({
                                ...prev,
                                [item.product._id]: newValue,
                              }));
                            }
                          }}
                          onKeyDown={(e) => handleKeyDown(e, item.product._id)}
                          disabled={alertShow}
                        />
                      )}
                      <button
                        onClick={() => {
                          if (item.quantity === item.product.stock) {
                            setStockMessage(
                              `You can't order more than stock (${item.product.stock})`
                            );
                            setAlertShow(true);
                          } else {
                            setSelectedItems({});
                            setSelectedTotal(0);
                            handleUpdateQuantity(
                              item.product._id,
                              item.quantity + 1
                            );
                          }
                        }}
                        className="px-2 py-1 bg-gray-200"
                        disabled={isQuantityUpdateting}
                      >
                        +
                      </button>
                    </div>

                    {isRemoving && removingItemId === item?.product._id ? (
                      <span className="animate-spin text-xl ml-1">
                        <AiOutlineLoading className="text-red-500" />
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRemoveFromCart(item?.product._id)}
                        className="text-red-500 hover:text-red-600 text-2xl"
                      >
                        <RiDeleteBin6Line />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full flex flex-col items-center justify-center gap-2">
                <ImFileEmpty className="text-2xl" />
                <span>You have no data in your cart</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-4 border-t pt-3">
            <div className="font-bold">
              Total: Rp. {selectedTotal.toLocaleString()}
            </div>
            <button
              onClick={handleCheckout}
              className={`px-4 py-2 text-white ${
                selectedTotal > 0
                  ? "bg-primary hover:bg-primary-dark"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              disabled={selectedTotal === 0}
            >
              <span>Checkout</span>
            </button>
          </div>
        </div>
      )}

      {alertShow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-3 rounded-md shadow-md max-w-[350px] md:max-w-[450px]">
            <p className="mb-4">{stockMessage}</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setAlertShow(false);
                  setStockMessage("");
                  setInputValues({});
                }}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Oke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
