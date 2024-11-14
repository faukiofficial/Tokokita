import "../../../styles/style.css";
import { FaSortUp } from "react-icons/fa6";
import { FaSortDown } from "react-icons/fa6";
import { MdAddShoppingCart } from "react-icons/md";
import { useSelector } from "react-redux";
import { useState } from "react";
import formatToK from "./../../helpers/formatToK";
import { useNavigate } from "react-router-dom";

const columns = [
  { key: "createdAt", label: "New" },
  { key: "stock", label: "Stock" },
  { key: "sold", label: "Sold" },
  { key: "salePrice", label: "Price" },
];

const ShoppingProduct = ({
  sortedProducts,
  formatNumber,
  sortProducts,
  setSortField,
  setSortDirection,
  sortConfig,
  handleAddToCart,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const navigate = useNavigate()

  const discountCounter = (price, salePrice) => {
    const discount = ((price - salePrice) / price) * 100;
    return Math.round(discount);
  };
  return (
    <div>
      <div className="w-full bg-white flex">
        {columns.map(({ key, label }) => (
          <div
            key={key}
            className={`border px-1 py-1 cursor-pointer flex-1`}
            onClick={() => {
              if (sortConfig.key === key) {
                const newDirection =
                  sortConfig.direction === "ascending"
                    ? "descending"
                    : "ascending";
                setSortField(key);
                setSortDirection(newDirection === "ascending" ? 1 : -1);
                sortProducts(key);
              } else {
                setSortField(key);
                setSortDirection(1);
                sortProducts(key);
              }
            }}
          >
            <div className="flex gap-1 items-center justify-center text-sm">
              <div>{label}</div>
              <div className="flex flex-col gap-1">
                <FaSortUp
                  className={`-mb-2 text-slate-400 ${
                    sortConfig.key === key
                      ? sortConfig.direction === "ascending"
                        ? "text-slate-600"
                        : ""
                      : ""
                  }`}
                />
                <FaSortDown
                  className={`-mt-2 text-slate-400 ${
                    sortConfig.key === key
                      ? sortConfig.direction === "descending"
                        ? "text-slate-600"
                        : ""
                      : ""
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 bg-slate-100 p-2">
        {sortedProducts.map((product) => (
          <div key={product._id} className="w-full">
            <div className="max-w-sm border overflow-hidden bg-white min-w-full rounded-t-lg">
              <div className="w-full aspect-[1/1] relative bg-white rounded-t-lg border-b border-gray-300">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-2">
                <div
                  className="font-semibold text-clamp-shop leading-tight text-base md:text-xl mb-2"
                  title={product.title}
                >
                  {product.title}
                </div>
                <div className="flex gap-1 items-center justify-between">
                  <span className="text-[12px] border border-primary p-[1px] px-[2px]">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-between px-5 mb-4">
                <div className="flex gap-1 font-semibold">
                  <span className="text-sm flex items-end">Rp.</span>{" "}
                  <span className="text-2xl">
                    {formatNumber(product.salePrice)}
                    {product.originalPrice && (
                      <span className="text-[12px] bg-primary-light ml-2 p-[2px] rounded-md">
                        -
                        {discountCounter(
                          product.originalPrice,
                          product.salePrice
                        )}
                        %
                      </span>
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-300 my-4 w-full"></div>
                <div className="flex items-center justify-around w-full text-sm">
                  <div className="text-gray-700">
                    <span className="text-sm flex items-center gap-[1px]">
                      Stock: {formatToK(product.stock)}
                    </span>
                  </div>
                  <div className="border-l border-gray-300 h-6 mx-4"></div>
                  <div className="text-gray-700">
                    <span className="text-sm relative">
                    Sold: {formatToK(product.sold)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-white text-black w-full px-3 py-1 border-[1px] border-primary"
                  onClick={() =>
                    (navigate(`/shop/product/${product._id}`))
                  }
                >
                  <span className="text-primary-dark font-semibold">
                    Details
                  </span>
                </button>
                <button
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-1 text-2xl"
                  onClick={() => {
                    if (user?.role === "user") {
                      handleAddToCart(product._id);
                    } else {
                      setModalOpen(true);
                    }
                  }}
                >
                  <MdAddShoppingCart />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-3 rounded-md shadow-md max-w-[350px] md:max-w-[450px]">
            <p className="mb-4">
              Anda harus login sebagai user terlebih dahulu
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                BATAL
              </button>
              <button
                onClick={() => (window.location.href = "/auth/login")}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
              >
                LOGIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingProduct;
