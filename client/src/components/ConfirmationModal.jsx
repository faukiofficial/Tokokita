import { AiOutlineLoading } from "react-icons/ai";
import "./../styles/style.css";

const ConfirmationModal = ({
  showConfirm,
  cancelDelete,
  confirmDelete,
  deleteLoading,
  productToDelete,
  errorMessage,
  setErrorMessage,
}) => {
  const deleteErrorMessage = () => {
    if (errorMessage) {
      setErrorMessage("");
    }
  };
  return (
    <>
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-3 rounded-md shadow-md max-w-[350px] md:max-w-[450px]">
            <p className="mb-4">
              Apakah Anda yakin ingin menghapus produk ini?
            </p>
            <div className="flex gap-2">
              <img
                src={productToDelete.images[0]}
                alt={productToDelete.title}
                className="border min-w-[60px] w-[60px] min-h-[60px] h-[60px]"
              />
              <div className="font-semibold text-clamp leading-tight">
                {productToDelete.title}
              </div>
            </div>
            <div
              className="flex justify-end gap-4"
              onClick={deleteErrorMessage}
            >
              <button
                onClick={cancelDelete}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                <div className="flex items-center justify-center gap-2">
                  {deleteLoading && (
                    <span className="animate-spin text-xl">
                      <AiOutlineLoading />
                    </span>
                  )}
                  <span>Hapus</span>
                </div>
              </button>
            </div>
            {errorMessage && (
              <p className="text-red-500 mt-3 text-sm">{errorMessage}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmationModal;
