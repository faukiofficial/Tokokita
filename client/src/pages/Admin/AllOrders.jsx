import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrders,
  updateOrderStatus,
} from "../../store/orderSlice/orderSlice";
import moment from "moment";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import formatNumber from "../../components/helpers/formatNumber";
import { IoIosClose } from "react-icons/io";
import { useLocation } from "react-router-dom";

const AllOrders = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [trackingCodes, setTrackingCodes] = useState({});

  const { orders, totalPages } = useSelector((state) => state.order);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    document.title = "All Orders | Shopping App";
  }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getAllOrders({ page: currentPage, limit }));
    }
  }, [dispatch, isAuthenticated, currentPage, limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleTrackingCodeChange = (orderId, value) => {
    setTrackingCodes({
      ...trackingCodes,
      [orderId]: value,
    });
  };

  const handleSubmitTrackingCode = (orderId) => {
    const trackingCode = trackingCodes[orderId];
    if (!trackingCode) return;

    dispatch(
      updateOrderStatus({
        orderId,
        newStatus: "ondelivery",
        trackingCode,
      })
    );
  };

  return (
    <div className="w-full p-6 bg-white shadow-md">
      <h2 className="text-2xl font-bold mb-4">All Orders</h2>
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
            {orders.map((order, index) => (
              <tr key={order._id} className="hover:bg-gray-100">
                <td className="py-2 border align-top text-center">
                  {(currentPage - 1) * limit + index + 1}
                </td>
                <td className="py-2 px-4 border align-top">
                  <span className="text-sm border-b">
                    {moment(order.createdAt).format("MMM Do YYYY, h:mm a")}
                  </span>
                  {order.items.map((item) => (
                    <div key={item._id} className="flex flex-col my-1">
                      <div className="flex items-start gap-2">
                        <img
                          src={
                            Array.isArray(item?.product?.images)
                              ? item.product.images[0]
                              : ""
                          }
                          alt={item?.product?.title || "Product Image"}
                          className="w-12 h-12 object-contain"
                        />
                        <div>
                          <p className="font-semibold">{item.product.title}</p>
                          <p className="text-sm text-gray-600">
                            x{item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </td>
                <td className="py-2 px-4 border align-top">
                  <p className="font-semibold">
                    {orders[index]?.addressId?.namaPenerima} |{" "}
                    {orders[index]?.addressId?.nomorTelepon}
                  </p>
                  <span>{orders[index]?.addressId?.jalan}</span>
                  <br />
                  <span>
                    {orders[index]?.addressId?.kelurahan}, RT/RW{" "}
                    {orders[index]?.addressId?.rtrw}, kec.{" "}
                    {orders[index]?.addressId?.kecamatan},
                  </span>
                  <br />
                  <span>
                    {orders[index]?.addressId?.kota?.type === "Kabupaten"
                      ? "Kab. "
                      : "Kota "}{" "}
                    {orders[index]?.addressId?.kota?.city_name},{" "}
                    {orders[index]?.addressId?.provinsi?.province},{" "}
                    {orders[index]?.addressId?.kota?.postal_code}
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
                    {order.paymentStatus === "unpaid" &&
                      order.status !== "cancelled" &&
                      "Waiting for payment . . ."}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.status === "process" &&
                      "On process in packaging . . ."}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.status === "ondelivery" &&
                      "Tracking Code: " + order?.trackingCode}
                  </div>
                  {order.paymentStatus === "paid" &&
                    order.status === "pending" && (
                      <div className="flex flex-col gap-1">
                        <div
                          className="hover:text-green-600 underline text-green-500 cursor-pointer"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowPaymentProof(true);
                          }}
                        >
                          Check
                        </div>
                        <div
                          className="hover:text-primary-hover underline text-primary cursor-pointer"
                          onClick={() => {
                            dispatch(
                              updateOrderStatus({
                                orderId: order._id,
                                newStatus: "process",
                                products: order.items,
                              })
                            );
                          }}
                        >
                          Process
                        </div>
                        <div
                          className="hover:text-red-600 underline text-red-500 cursor-pointer"
                          onClick={() => {
                            dispatch(
                              updateOrderStatus({
                                orderId: order._id,
                                newStatus: "cancelled",
                              })
                            );
                          }}
                        >
                          Cancel
                        </div>
                      </div>
                    )}
                  {order.paymentStatus === "paid" &&
                    order.status === "process" && (
                      <div className="flex flex-col items-start gap-1">
                        <input
                          type="text"
                          value={trackingCodes[order._id] || ""}
                          onChange={(e) =>
                            handleTrackingCodeChange(order._id, e.target.value)
                          }
                          placeholder="Enter tracking code"
                          className="border px-2 py-1"
                        />
                        <button
                          className="text-primary hover:text-primary-hover underline"
                          onClick={() => handleSubmitTrackingCode(order._id)}
                        >
                          Submit Tracking Code
                        </button>
                      </div>
                    )}
                  {order.paymentStatus === "paid" &&
                    order.status === "ondelivery" && (
                      <div>
                        <a
                          className="hover:text-primary-hover underline text-primary cursor-pointer"
                          href="https://rajaongkir.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Track Order
                        </a>
                        <div
                          className="hover:text-green-600 underline text-green-500 cursor-pointer"
                          onClick={() => {
                            dispatch(
                              updateOrderStatus({
                                orderId: order._id,
                                newStatus: "completed",
                              })
                            );
                          }}
                        >
                          Complete
                        </div>
                      </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center mb-4 gap-2 mt-4">
        {/* Dropdown untuk memilih batas per halaman */}
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

        {/* Pagination Controls */}
        <div className="flex justify-end items-center gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <MdNavigateBefore />
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <MdNavigateNext />
          </button>
        </div>
      </div>

      {showPaymentProof && selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPaymentProof(false)}
        >
          <div
            className="relative flex flex-col justify-between items-center bg-white mx-4 max-w-[400px] overflow-y-scroll overflow-hidden max-h-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 top-2 self-end mr-2 sticky cursor-pointer"
              onClick={() => {
                setSelectedOrder(null);
                setShowPaymentProof(false);
              }}
            >
              <IoIosClose />
            </div>

            <img
              src={selectedOrder?.paymentProof}
              alt="no image"
              className="w-50"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
