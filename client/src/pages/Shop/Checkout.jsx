import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProductById } from "../../store/productSlice/productSlice";
import { checkout } from "../../store/orderSlice/orderSlice";
import { AiOutlineLoading } from "react-icons/ai";
import { getAllAddress } from "../../store/addressForm-slice/addressFormSlice";
import formatNumber from "../../components/helpers/formatNumber";
import { fetchShippingCosts } from "../../store/shippingCostSlice/shippingCostSlice";
import { removeFromCart } from "../../store/cartSlice/cartSlice";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedItems } = location.state;
  const { isCheckoutLoading } = useSelector((state) => state.order);
  const { addresses } = useSelector((state) => state.address);
  const { isLoading } = useSelector((state) => state.product);
  const { storeProfile } = useSelector((state) => state.storeProfile);
  const { costs } = useSelector((state) => state.shipping);

  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [selectedShippingCode, setSelectedShippingCode] = useState("");
  const [totalShippingCost, setTotalShippingCost] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState({}); // State untuk alamat
  const [selectedCourierCode, setSelectedCourierCode] = useState("");

  useEffect(() => {
    document.title = "Checkout | Shopping App";
  }, []);

  useEffect(() => {
    dispatch(getAllAddress());
  }, [dispatch]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const products = [];
      for (const productId of Object.keys(selectedItems)) {
        const product = await dispatch(getProductById(productId)).unwrap();
        products.push(product);
      }
      setFetchedProducts(products);
    };

    fetchProductDetails();
  }, [dispatch, selectedItems]);

  const handleSelectAddress = (addressId) => {
    const selected = addresses.find((address) => address._id === addressId);
    setSelectedAddress(selected);
  };

  const totalWithoutShipping = fetchedProducts.reduce(
    (total, item) => total + item.salePrice * selectedItems[item._id],
    0
  );
  const totalWeight = fetchedProducts.reduce(
    (total, item) => total + item.weight * selectedItems[item._id],
    0
  );

  useEffect(() => {
    const handleFetchCosts = () => {
      if (
        !storeProfile?.alamat?.kota?.city_id ||
        !selectedAddress?.kota?.city_id
      )
        return;

      const couriers = ["jne", "pos", "tiki"];
      const fetchPromises = couriers.map((courier) => {
        if (!costs || !costs.length) {
          dispatch(
            fetchShippingCosts({
              origin: storeProfile?.alamat?.kota?.city_id,
              destination: selectedAddress?.kota?.city_id,
              weight: totalWeight,
              courier,
            })
          );
        }
      });

      Promise.all(fetchPromises).catch((error) => {
        console.error("Error fetching shipping costs:", error);
      });
    };

    handleFetchCosts();
  }, [
    dispatch,
    storeProfile?.alamat?.kota?.city_id,
    selectedAddress?.kota?.city_id,
    totalWeight,
    costs,
  ]);

  const handleSelectShipping = (shippingOption) => {
    setSelectedShippingOption(shippingOption);
    setSelectedShippingCode(selectedCourierCode);
    setTotalShippingCost(shippingOption.cost[0].value);
  };

  const totalPrice = totalWithoutShipping + totalShippingCost;

  const uniqueCouriers = costs.reduce((acc, courier) => {
    if (!acc[courier.code]) {
      acc[courier.code] = { ...courier };
    } else {
      acc[courier.code].costs = acc[courier.code].costs.concat(courier.costs);
    }
    return acc;
  }, {});

  const uniqueCourierList = Object.values(uniqueCouriers);

  const handleRemoveFromCart = () => {
    console.log("handleRemoveFromCart jalan");
    const productIds = fetchedProducts.map((product) => product._id);

    productIds.forEach((id) => {
      dispatch(removeFromCart({ productId: id }));
    });
  };

  const handleConfirmCheckout = () => {
    const orderData = {
      items: fetchedProducts,
      quantities: selectedItems,
      addressId: selectedAddress._id,
      shippingCost: totalShippingCost,
      totalPrice: totalWithoutShipping,
      shippingOption: selectedShippingOption,
      selectedShippingCode,
    };

    dispatch(checkout({ orderData }))
      .then((response) => {
        if (response.payload.success) {
          navigate("/shop/payment", {
            state: {
              items: fetchedProducts,
              quantities: selectedItems,
              addressId: selectedAddress._id,
              shippingCost: totalShippingCost,
              totalWithoutShipping,
              selectedShippingOption,
              selectedShippingCode,
              orderId: response.payload.newOrder._id,
            },
          });
          setSelectedShippingOption(null);
          setSelectedShippingCode("");
          setSelectedAddress(null);
        }
      })
      .catch((error) => {
        console.error("Checkout failed:", error);
      });
  };

  return (
    <div className="w-full p-4 bg-white">
      <h2 className="text-2xl font-semibold mb-4">Checkout Summary</h2>

      <div className="mb-7 border-b pb-3">
        <h3 className="text-xl font-semibold mb-2">
          Pilih Alamat:{" "}
          {addresses.length === 0 && (
            <div className="text-red-500 text-sm">
              {" "}
              Tidak ada alamat{" "}
              <Link to="/shop/my-address">
                <span className="text-primary underline">Tambah Alamat</span>
              </Link>
            </div>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`border rounded-md p-3 shadow-sm cursor-pointer ${
                selectedAddress._id === address._id ? "bg-primary-light" : ""
              }`}
              onClick={() => {
                handleSelectAddress(address._id);
              }}
            >
              <h4 className="font-semibold">
                {address.namaPenerima} | {address.nomorTelepon}
              </h4>
              <p>
                {address.jalan}, {address.rtrw && "RT/RW"} {address.rtrw},{" "}
                {address.kelurahan}, Kec. {address.kecamatan}
              </p>
              <p className="mb-2">
                {address.kota.type === "Kabupaten" ? "Kab." : "Kota"}{" "}
                {address.kota.city_name}, {address.provinsi.province},{" "}
                {address.kota.postal_code}
              </p>
            </div>
          ))}
        </div>
      </div>

      {isLoading || fetchedProducts.length === 0 ? (
        <div className="flex justify-center">
          <AiOutlineLoading className="animate-spin text-2xl" />
        </div>
      ) : (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">Product</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Quantity</th>
              <th className="border px-4 py-2">Weight</th>
            </tr>
          </thead>
          <tbody>
            {fetchedProducts.map((item) => {
              return (
                <tr key={item._id}>
                  <td className="border px-4 py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-10 h-10 object-contain"
                      />
                      {item.title}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    Rp {formatNumber(item.salePrice)}
                  </td>
                  <td className="border px-4 py-2">
                    {selectedItems[item._id]}
                  </td>
                  <td className="border px-4 py-2">
                    @{formatNumber(item.weight)} gr
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="flex justify-between mt-4 items-start">
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-4">Pilih Pengiriman:</h3>
            {selectedAddress && costs && costs.length > 0 ? (
              <div className="flex items-center gap-4">
                {uniqueCourierList.map((courier) => (
                  <div
                    key={courier.code}
                    className={`border rounded-md p-2 cursor-pointer ${
                      selectedShippingCode === courier.code
                        ? "bg-primary-light"
                        : ""
                    }`}
                    onClick={() => setSelectedCourierCode(courier.code)}
                  >
                    <h4 className="font-semibold">
                      {courier.code.toUpperCase()}
                    </h4>
                  </div>
                ))}
              </div>
            ) : (
              <span className="p-2 bg-red-300">
                Pilih alamat terlebih dahulu
              </span>
            )}
          </div>

          {selectedShippingOption && (
            <span className="mt-4 p-2 bg-green-300 rounded">
              {selectedShippingCode.toUpperCase()} -{" "}
              {selectedShippingOption.description} (
              {selectedShippingOption.service} :{" "}
              {selectedShippingOption.cost[0].etd}{" "}
              {selectedShippingOption.cost[0].etd.includes("HARI")
                ? ""
                : "HARI"}
              )
            </span>
          )}
        </div>

        <table>
          <tbody>
            <tr>
              <td colSpan="3" className="text-right font-bold">
                Total Harga:
              </td>
              <td className="px-4 py-2 font-bold">
                Rp. {formatNumber(totalWithoutShipping)}
              </td>
            </tr>
            <tr>
              <td colSpan="3" className="text-right font-bold">
                Total Weight:
              </td>
              <td className="px-4 py-2 font-bold">
                {formatNumber(totalWeight)} gr
              </td>
            </tr>
            <tr>
              <td colSpan="3" className="text-right font-bold">
                Ongkir:
              </td>
              <td className="px-4 py-2 font-bold">
                Rp. {formatNumber(totalShippingCost)}
              </td>
            </tr>
            <tr>
              <td colSpan="3" className="text-right font-bold">
                Total + Ongkir:
              </td>
              <td className="border border-primary px-4 py-2 font-bold">
                Rp. {formatNumber(totalPrice)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {costs && costs.length > 0 && selectedCourierCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-md shadow-md max-w-3xl w-full overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Opsi Pengiriman</h2>
            <table className="min-w-full border-collapse">
              <tbody>
                {costs
                  .filter((cost) => cost.code === selectedCourierCode)
                  .flatMap((cost) =>
                    cost.costs.map((option) => (
                      <tr
                        key={option.service}
                        className="border-b cursor-pointer hover:bg-primary-light"
                        onClick={() => {
                          handleSelectShipping(option);
                          setSelectedCourierCode("");
                        }}
                      >
                        <td className="border px-4 py-2">
                          {option.description} ({option.service})
                        </td>
                        <td className="border px-4 py-2">
                          Rp. {formatNumber(option.cost[0].value)} (
                          {option.cost[0].etd.toLowerCase()}{" "}
                          {option.cost[0].etd.includes("HARI") ? "" : "hari"})
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
            </table>
            <button
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover mt-4"
              onClick={() => setSelectedCourierCode("")}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            handleConfirmCheckout();
            handleRemoveFromCart();
          }}
          className={`px-4 py-2 text-white w-[200px] ${
            isCheckoutLoading
              ? "bg-primary-light cursor-not-allowed"
              : "bg-primary hover:bg-primary-dark"
          }`}
          disabled={isCheckoutLoading}
        >
          {isCheckoutLoading ? (
            <AiOutlineLoading className="animate-spin" />
          ) : (
            "Confirm Checkout"
          )}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
