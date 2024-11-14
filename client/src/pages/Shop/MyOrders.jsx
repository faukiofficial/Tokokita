import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserOrders,
  updateOrderStatus,
  uploadPaymentProof,
} from "../../store/orderSlice/orderSlice";
import moment from "moment";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import formatNumber from "../../components/helpers/formatNumber";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useNavigate } from "react-router-dom";
import { IoIosClose } from "react-icons/io";

const MyOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const { isUploadingProof, proofUploadSuccess, proofUploadError } =
    useSelector((state) => state.order);

  const {
    userOrders,
    isLoadingOrders,
    errorMessage,
    totalUserOrders,
    totalUserPages,
    currentUserPage,
  } = useSelector((state) => state.order);

  console.log(
    "userOrders",
    userOrders,
    totalUserOrders,
    totalUserPages,
    currentUserPage
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);


  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProof(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    } else {
      setPaymentProof(null);
      setPreviewUrl(null);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentProof) {
      alert("Silakan unggah bukti transfer.");
      return;
    }

    dispatch(
      uploadPaymentProof({ orderId: selectedOrder._id, paymentProof })
    );

    console.log("Payment proof uploaded successfully", userOrders);
  };

  useEffect(() => {
    if (proofUploadSuccess) {
      setShowPayment(false);
      setSelectedOrder(null);
      setPreviewUrl(null);
      setPaymentProof(null);
    }
  }, [navigate, proofUploadSuccess]);

  useEffect(() => {
      dispatch(getUserOrders({ page: currentPage, limit }));
  }, [dispatch, currentPage, limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalUserPages) {
      setCurrentPage(newPage);
    }
  };

   const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setCurrentPage(1);
  };

  if (isLoadingOrders) {
    return (
      <div className="text-center">
        <Skeleton count={3} height={100} width="100%" />
      </div>
    );
  }

  if (errorMessage) {
    return <div>Error: {errorMessage}</div>;
  }

  if (!userOrders || userOrders.length === 0) {
    return <div>No orders found.</div>;
  }

  return (
    <div className="w-full p-6 bg-white shadow-md">
      <h2 className="text-2xl font-bold mb-4">My Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-slate-50">
            <tr>
              <th className="py-2 border">No</th>
              <th className="py-2 px-4 border">Products</th>
              <th className="py-2 px-4 border">Address</th>
              <th className="py-2 px-4 border">Total Price</th>
              <th className="py-2 px-4 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {userOrders?.map((order, index) => (
              <tr key={order._id} className="hover:bg-gray-100">
                <td className="py-2 border align-top text-center">
                  {(currentPage - 1) * limit + index + 1}
                </td>
                <td className="py-2 px-4 border align-top">
                  <span className="text-sm border-b">
                    {moment(order.createdAt).format("MMM Do YYYY, h:mm a")}
                  </span>
                  {order?.items?.map((item) => (
                    <div key={item._id} className="flex flex-col my-1">
                      <div className="flex items-start gap-2">
                        <img
                          src={Array.isArray(item?.product?.images) ? item.product.images[0] : ""}
                          alt={item?.product?.title || "Product Image"}
                          className="w-12 h-12 object-contain"
                        />
                        <div>
                          <p className="font-semibold">{item?.product?.title}</p>
                          <p className="text-sm text-gray-600">
                            x{item?.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </td>
                <td className="py-2 px-4 border align-top">
                  <p className="font-semibold">
                    {order.addressId?.namaPenerima} |{" "}
                    {order.addressId?.nomorTelepon}
                  </p>
                  <span>{order.addressId?.jalan}</span>
                  <br />
                  <span>
                    {order.addressId?.kelurahan}, RT/RW{" "}
                    {order.addressId?.rtrw}, kec.{" "}
                    {order.addressId?.kecamatan},
                  </span>
                  <br />
                  <span>
                    {order.addressId?.kota?.type === "Kabupaten"
                      ? "Kab. "
                      : "Kota "}{" "}
                    {order.addressId?.kota?.city_name},{" "}
                    {order.addressId?.provinsi?.province},{" "}
                    {order.addressId?.kota?.postal_code}
                  </span>
                </td>
                <td className="py-2 px-4 border align-top">
                  <div className="font-semibold mb-1">
                    Rp. {formatNumber(order.totalPrice + order.shippingCost)}
                  </div>
                  <div className="text-sm p-1 border">
                    <div>Price: Rp. {formatNumber(order.totalPrice)}</div>
                    <div>
                      Shipping Cost: Rp. {formatNumber(order.shippingCost)}
                    </div>
                  </div>
                </td>
                <td className="py-2 px-4 border align-top capitalize">
                  <div>
                    {order.paymentStatus} | {order.status}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.status === "pending" &&
                      order.paymentStatus === "paid" &&
                      "Waiting for confrmation . . ."}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.status === "process" &&
                      order.paymentStatus === "paid" &&
                      "On process in packaging . . ."}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.status === "ondelivery" &&
                      "Tracking Code: " + order?.trackingCode}
                  </div>
                  {order.paymentStatus === "unpaid" && order.status !== "cancelled" && (
                    <div className="mt-3 flex gap-2">
                      <div
                        className="hover:text-primary-hover underline text-primary cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowPayment(true);
                        }}
                      >
                        Pay Now
                      </div>
                      <div
                        className="hover:text-red-500 underline text-red-600 cursor-pointer"
                        onClick={() => {
                            dispatch(
                              updateOrderStatus({
                                orderId: order._id,
                                newStatus: "cancelled",
                              })
                            )
                          }}
                      >
                        Cancel
                      </div>
                    </div>
                  )}
                  {order.paymentStatus === "paid" &&
                    order.status === "ondelivery" && (
                      <a
                        className="hover:text-primary-hover underline text-primary cursor-pointer"
                        href="https://rajaongkir.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Track Order
                      </a>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center mb-4 gap-2 mt-4">
        <div>
          <select
            id="limit"
            value={limit}
            onChange={handleLimitChange}
            className="border rounded px-1 py-1 focus:outline-none"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>

        <div className="flex justify-end items-center gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <MdNavigateBefore />
          </button>
          <span>
            {currentPage} / {totalUserPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalUserPages}
          >
            <MdNavigateNext />
          </button>
        </div>
      </div>

      {showPayment && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col justify-between items-center bg-white p-6 relative">
            <div
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 absolute -top-2 -right-2"
              onClick={() => {
                setShowPayment(false);
                setSelectedOrder(null);
                setPreviewUrl(null);
                setPaymentProof(null);
              }}
            >
              <IoIosClose />
            </div>

            {selectedOrder && (
              <div className="mb-4">
                <p className="font-bold text-2xl">
                  Rp.{" "}
                  {formatNumber(
                    selectedOrder.totalPrice + selectedOrder.shippingCost
                  )}
                </p>
              </div>
            )}

            <div>
              <div>Pembayaran melalui:</div>

              <div>
                <p className="text-lg font-semibold">
                  BSI : 80390898209 a/n TokoKita
                </p>
              </div>
            </div>
            <div>
              <div className="my-4">
                <h2 className="font-semibold mb-1">Upload Bukti Transfer:</h2>
                <label
                  htmlFor="paymentProof"
                  className={`block mb-2 font-semibold ${
                    previewUrl ? "hidden" : ""
                  }`}
                >
                  <div className="w-40 h-40 border bg-slate-100 flex justify-center items-center text-slate-400">
                    Click here
                  </div>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  id="paymentProof"
                  className="hidden"
                />
              </div>

              {previewUrl && (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="Preview Bukti Transfer"
                    className="w-40 object-contain border"
                  />
                </div>
              )}

              {proofUploadError && (
                <p className="text-red-500">{proofUploadError}</p>
              )}

              <button
                onClick={handleConfirmPayment}
                disabled={isUploadingProof}
                className="mt-4 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded"
              >
                {isUploadingProof ? "Mengunggah..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
