import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProduct,
  getProductById,
} from "../../store/productSlice/productSlice";
import { useNavigate, useParams } from "react-router-dom";
import { addToCart } from "../../store/cartSlice/cartSlice";
import "../../styles/style.css";
import formatToK from "../../components/helpers/formatToK";
import formatNumber from "../../components/helpers/formatNumber";
import discountCounter from "../../components/helpers/discountCounter";
import { MdAddShoppingCart } from "react-icons/md";

const DetailProduct = () => {
  const [selectedImage, setSelectedImage] = useState("");
  const [addToCartQuantity, setAddToCartQuantity] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const dispatch = useDispatch();
  const { id } = useParams();
  const { product, allproducts } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = `${
      product?.title ? product?.title : "Detail Product"
    } - Shopping App`;
  }, [product?.title]);

  useEffect(() => {
    dispatch(getProductById(id));
    dispatch(getAllProduct({ selectedCategory: product?.category, limit: 6 }));
  }, [dispatch, id, product?.category]);

  const handleAddToCart = (productId, quantity = addToCartQuantity) => {
    dispatch(addToCart({ productId, quantity }));
  };

  const handleQuantityChange = (value) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) {
      setAddToCartQuantity(1);
    } else {
      const clampedValue = Math.max(
        1,
        Math.min(numericValue, product?.stock || 1)
      );
      setAddToCartQuantity(clampedValue);
    }
  };

  const handleDecrease = () => {
    setAddToCartQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setAddToCartQuantity((prev) =>
      Math.min(prev + 1, product?.stock || prev + 1)
    );
  };

  const navigate = useNavigate();

  const handleBuyNow = () => {
    navigate("/shop/checkout", {
      state: {
        selectedItems: {
          [product?._id]: addToCartQuantity,
        },
        total: product?.salePrice * addToCartQuantity,
      },
    });
  };

  return (
    <div className="p-2 md:p-8 bg-white shadow-lg ">
      <div className="flex flex-col md:flex-row gap-5 xl:gap-10">
        <div className="w-full md:w-1/2 max-w-[430px] flex flex-row md:flex-col gap-2">
          <div className="border border-primary-light min-h-[200px] min-w-[200px] sm:min-h-[380px] sm:min-w-[380px] xl:min-h-[430px] xl:min-w-[430px] rounded-md mb-4 flex items-center justify-center">
            <img
              src={selectedImage || product?.images[0]}
              alt={product?.title}
              className="rounded-md object-contain h-full w-full"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-[170px] h-[100px] sm:min-w-[80px] sm:min-h-[80px]">
            {product?.images.slice(0, 5).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`product-${index}`}
                onClick={() => setSelectedImage(image)}
                className={`h-20 w-20 object-contain shadow-md cursor-pointer transition-transform transform ${
                  selectedImage === image
                    ? "border-2 border-primary"
                    : "hover:scale-105 border"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:gap-[12rem]">
          <div>
            <h1 className="text-2xl font-bold mb-4">{product?.title}</h1>

            <div className="text-3xl font-semibold flex items-end gap-2 text-primary-dark mb-4">
              <span>
                Rp. {product?.salePrice && formatNumber(product?.salePrice)}
              </span>
              <span className="text-sm line-through text-gray-500">
                Rp.{" "}
                {product?.originalPrice && formatNumber(product?.originalPrice)}
              </span>
            </div>

            <div className="text-gray-700 mb-4 flex items-center gap-2">
              <span className="pr-2 border-r">{product?.category}</span>
              {product?.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-200 px-2 py-1 text-sm font-semibold text-gray-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 items-start">
            <div className="flex gap-2 items-center">
              <div className="flex items-center border border-gray-300">
                <button
                  onClick={handleDecrease}
                  className={`px-3 py-1 text-xl font-bold text-primary border-r ${
                    addToCartQuantity <= 1
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-primary-light"
                  }`}
                  disabled={addToCartQuantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  max={product?.stock}
                  value={addToCartQuantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-10 text-center border-none focus:outline-none no-spin"
                />
                <button
                  onClick={handleIncrease}
                  className={`px-3 py-1 text-xl font-bold text-primary border-l ${
                    addToCartQuantity >= product?.stock
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-primary-light"
                  }`}
                  disabled={addToCartQuantity >= product?.stock}
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500">
                (tersedia {product?.stock})
              </span>
              <span className="pl-2 border-l text-sm text-gray-500">
                {product?.sold}x Terjual
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => {
                  if (user?.role === "user") {
                    handleAddToCart(id);
                  } else {
                    setModalOpen(true);
                  }
                }}
                className="border-2 border-primary hover:bg-slate-100 text-primary font-semibold py-2 px-3 shadow-lg"
              >
                Tambahkan ke Keranjang
              </button>

              <button
                onClick={() => {
                  if (user?.role === "user") {
                    handleBuyNow();
                  } else {
                    setModalOpen(true);
                  }
                }}
                className="bg-primary border-2 border-primary hover:bg-primary-hover hover:border-primary-hover text-white font-semibold py-2 px-3 shadow-lg"
              >
                Langsung Beli
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border">
        <div className="text-lg font-semibold mb-4 bg-slate-200 p-2">
          Deskripsi Produk
        </div>
        <p className="text-gray-700 mb-4 px-4">
          <strong>Berat:</strong>{" "}
          {product?.weight ? formatNumber(product?.weight) : ""} grams
        </p>
        <p className="text-gray-600 mb-4 px-4 whitespace-pre-wrap text-justify">
          {product?.description}
        </p>
      </div>

      <div className="mt-6">
        <div className="text-lg font-semibold mb-2">Produk Serupa</div>
        <div className="flex items-center gap-2 bg-slate-100 p-2 overflow-x-auto">
          {allproducts?.map((product) => (
            <div key={product._id} className={`w-[20%] min-w-[200px] ${product._id === id ? "hidden" : ""}`}>
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
                    onClick={() => {
                      navigate(`/shop/product/${product._id}`);
                      setSelectedImage("")
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
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
                onClick={() => navigate("/auth/login")}
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

export default DetailProduct;
