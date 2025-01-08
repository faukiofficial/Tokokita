import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import formatNumber from "../../components/helpers/formatNumber";
import { useDispatch, useSelector } from "react-redux";
// import { uploadPaymentProof } from "../../store/orderSlice/orderSlice";
import toast from "react-hot-toast";
import { newPayment } from "../../store/orderSlice/orderSlice";

const PaymentPage = () => {
  // const [paymentProof, setPaymentProof] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [midtransToken, setMidtransToken] = useState(null);
  const { newPaymentLoading } = useSelector((state) => state.order);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    isUploadingProof,
    proofUploadSuccess,
    proofUploadError,
  } = useSelector((state) => state.order);
  const {user} = useSelector((state) => state.auth);

  const location = useLocation();
  const {
    items,
    quantities,
    shippingCost,
    selectedShippingCode,
    totalWithoutShipping,
    selectedShippingOption,
    orderId,
  } = location.state;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const totalToPay = totalWithoutShipping + shippingCost;

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setPaymentProof(file);
  //     const preview = URL.createObjectURL(file);
  //     setPreviewUrl(preview);
  //   } else {
  //     setPaymentProof(null);
  //     setPreviewUrl(null);
  //   }
  // };

  // const handleConfirmPayment = async () => {
  //   if (!paymentProof) {
  //     toast.error("Silakan unggah bukti transfer.");
  //     return;
  //   }

  //   dispatch(uploadPaymentProof({ orderId, paymentProof }));
  // };

  // useEffect(() => {
  //   if (proofUploadSuccess) {
  //     navigate("/shop/my-orders");
  //   }
  // }, [navigate, proofUploadSuccess]);

  // Midtrans
  const handleBuy = async () => {
    if (course && userInfo) {
      const item_details = {
        id: course._id,
        quantity: 1,
        price: course.price,
        name: course.name,
      };

      const customer_details = {
        name: user?.name,
        email: user?.email,
      };

      try {
        const transaction = await dispatch(
          newPayment({
            order_id: `${orderId}-${Date.now()}`,
            gross_amount: totalToPay,
            item_details: item_details,
            customer_details: customer_details,
          })
        );

        if (transaction.payload?.success) {
          setMidtransToken(transaction.payload.token);
        } else {
          toast.error(
            transaction.payload?.message ||
              "Failed to create payment transaction."
          );
        }
      } catch (error) {
        console.error("Payment failed:", error);
        toast.error(
          "An error occurred while processing the payment. Please try again."
        );
      }
    } else {
      toast.error("Please Login")
    }
  };

  useEffect(() => {
    if (midtransToken) {
      window.snap.pay(midtransToken, {
        onSuccess: async (result) => {
          console.log("Result", result)
          if (orderId) {
            toast.success("Payment success");
            const data = {
              courseId: orderId,
              payment_info: "Paid"
            }
            const process = await dispatch(createOrder(data));
            if (process.meta.requestStatus === "fulfilled") {
              dispatch(updateUserCourses({ _id: course?._id}));
            }
            setMidtransToken(null);
            navigate("/shop/my-orders");
          }
        },
        onError: () => {
          toast.error("Payment error");
          setMidtransToken(null);
        },
      });
    }
  }, [midtransToken]);


  useEffect(() => {
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";

    const scriptTag = document.createElement("script");
    scriptTag.src = midtransScriptUrl;

    const myMidtransClientKey = import.meta.env
      .VITE_MIDTRANS_CLIENT_KEY;
    scriptTag.setAttribute("data-client-key", myMidtransClientKey);

    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold mb-4">Payment Summary</h1>

      <div className="my-4">
        <ul className="border">
          {items.map((item, index) => (
            <li
              key={item._id}
              className={`flex items-center justify-between p-2 hover:bg-slate-200 ${
                index % 2 === 1 ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <span className="text-sm">
                    Rp. {formatNumber(item.salePrice)} x {quantities[item._id]}
                  </span>
                </div>
              </div>
              <span>
                Rp. {formatNumber(item.salePrice * quantities[item._id])}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Shipping Information:</h2>
        <p>
          {selectedShippingCode.toUpperCase()} -{" "}
          {selectedShippingOption.description} ({selectedShippingOption.service}{" "}
          : {selectedShippingOption.cost[0].etd}{" "}
          {selectedShippingOption.cost[0].etd.includes("HARI") ? "" : "HARI"})
        </p>
        <p>Shipping Cost: Rp. {formatNumber(shippingCost)}</p>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold">
          Total: Rp. {formatNumber(totalToPay)}
        </p>
      </div>

      {!paymentOpen && (
        <button
          onClick={() => setPaymentOpen(true)}
          className="mt-4 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded"
        >
          Pay Now
        </button>
      )}

      {paymentOpen && (
        <div className="flex flex-col lg:flex-row justify-between items-center ">
          <div>
            <div>
              Pembayaran melalui:
            </div>

            <div>
              <p className="text-xl font-bold">
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

            {proofUploadError && <p className="text-red-500">{proofUploadError}</p>}

            <button
              onClick={handleConfirmPayment}
              disabled={isUploadingProof}
              className="mt-4 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded"
            >
              {isUploadingProof ? "Loading..." : "Confirm Payment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
