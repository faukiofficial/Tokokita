import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineLoading } from "react-icons/ai";
import { categories, tags } from "../../data/CategriesAndTags";
import { IoIosClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, editProduct, getProductById } from "../../store/productSlice/productSlice";
import '../../styles/style.css'
import toast from "react-hot-toast";

const ProductUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [originalPrice, setOriginalPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [weight, setWeight] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);
  const [productId, setProductId] = useState(null);
  const [deletedImages, setDeletedImages] = useState([]);
  const [error, setError] = useState("");
  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {errorMessage, product, addProductLoading, editProductLoading} = useSelector((state) => state.product)

  const {isAuthenticated} = useSelector((state) => state.auth)
  

  const path = location.pathname === "/admin/add-product";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (path) {
      resetForm();
    }
  }, [path]);

  useEffect(() => {
    document.title = `${
      productId ? "Edit Product" : "Add Product"
    } - Shopping App`;
  }, [location, productId]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const id = query.get("id");
    if (id) {
      setProductId(id);
      dispatch(getProductById(id));
    }
  }, [location.search, dispatch]);

  // Fungsi untuk menambahkan titik pada angka
  const formatNumber = (num) => {
    if (num == null) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Fungsi untuk menghilangkan titik
  const removeDots = (value) => {
    return value.replace(/\./g, "");
  };

  useEffect(() => {
    if (product && productId) {
      setTitle(product.title);
      setDescription(product.description);
      setCategory(product.category);
      setSelectedTags(product.tags);
      setOriginalPrice(formatNumber(product.originalPrice));
      setSalePrice(product.salePrice ? formatNumber(product.salePrice) : "");
      setWeight(formatNumber(product.weight));
      setStock(formatNumber(product.stock));
      setImages(product.images);
    }
  }, [product, productId]);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    if (images.length + newFiles.length > 5) {
      toast.error("You can only upload a maximum of 5 images.");
      return;
    }
    setImages((prevImages) => [...prevImages, ...newFiles]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const newFiles = Array.from(event.dataTransfer.files);
    if (images.length + newFiles.length > 5) {
      toast.error("You can only upload a maximum of 5 images.");
      return;
    }
    setImages((prevImages) => [...prevImages, ...newFiles]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeImage = (index) => {
    const imageToRemove = images[index];

    // Jika gambar yang dihapus berasal dari database (sudah ada sebelumnya)
    if (productId && typeof imageToRemove === "string") {
      setDeletedImages((prevDeletedImages) => [
        ...prevDeletedImages,
        imageToRemove,
      ]);
    }

    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (category) {
      setAvailableTags(tags[category] || []);
    } else {
      setAvailableTags([]);
    }
  }, [category]);

  const handleTagChange = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleOriginalPriceChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Hanya ambil angka
    setOriginalPrice(formatNumber(rawValue));
  };

  const handleSalePriceChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setSalePrice(formatNumber(rawValue));
  };

  const handleWeightChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setWeight(formatNumber(rawValue));
  };

  const handleStockChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setStock(formatNumber(rawValue));
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setSelectedTags([]);
    setOriginalPrice("");
    setSalePrice("");
    setWeight("");
    setStock("");
    setImages([]);
    setDeletedImages([]);
    setProductId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setError(
        `Anda tidak memiliki akses untuk ${
          productId ? "mengedit" : "menghapus"
        } produk.`
      );
      return;
    }


    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("tags", selectedTags);
    formData.append("originalPrice", removeDots(originalPrice));
    formData.append("salePrice", removeDots(salePrice));
    formData.append("weight", removeDots(weight));
    formData.append("stock", removeDots(stock));

    for (let i = 0; i < images.length; i++) {
      if (typeof images[i] !== "string") {
        formData.append("images", images[i]);
      }
    }

    formData.append("deletedImages", JSON.stringify(deletedImages));

    try {
      if (productId) {
        const result = await dispatch(editProduct({formData, productId}))
        if (result.meta.requestStatus === "fulfilled") {
          navigate("/admin/products");
        }
      } else {
        const result = await dispatch(addProduct({formData}))
        if (result.meta.requestStatus === "fulfilled") {
          navigate("/admin/products");
        }
      }

    } catch (error) {
      setError(error)
    }
  };

  return (
    <div className="mx-auto px-5 p-4 md:px-10 border bg-white pb-10">
      <div className="text-2xl font-bold mb-4">
        {productId ? "Edit Product" : "Add New Product"}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload Section */}
        <div className="w-full border border-gray-300 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images
          </label>
          <div
            className="flex items-center space-x-4"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="flex space-x-2 overflow-x-auto no-scrollbar cart-items-container">
              {images.slice(0, 5).map((image, index) => (
                <div
                  key={index}
                  className="relative w-32 h-32 flex-shrink-0 bg-white"
                >
                  <img
                    src={
                      typeof image === "string"
                        ? image
                        : URL.createObjectURL(image)
                    }
                    alt={`preview-${index}`}
                    className="w-full h-full object-contain rounded-md border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 text-white bg-primary hover:bg-primary-light rounded-full w-4 h-4 flex items-center justify-center focus:outline-none"
                  >
                    <IoIosClose />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <div className="relative border border-gray-300 bg-orange-100 w-32 h-32 flex-shrink-0 flex items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <p className="text-gray-500 flex flex-col items-center justify-center">
                    <span>Add Images</span>
                    <span className="text-sm">({images.length}/5)</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        {[
          {
            label: "Title",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            required: true,
            as: "text",
          },
          {
            label: "Category",
            type: "select",
            value: category,
            onChange: (e) => setCategory(e.target.value),
            options: categories.map((cat) => ({ id: cat.id, name: cat.name })),
            required: true,
          },
          {
            label: "Original Price",
            value: originalPrice,
            onChange: handleOriginalPriceChange,
            prefix: "Rp.",
            placeholder: "Original Price is higher than Sale Price.",
          },
          {
            label: "Sale Price",
            value: salePrice,
            onChange: handleSalePriceChange,
            required: true,
            prefix: "Rp.",
          },
          {
            label: "Weight (gr)",
            value: weight,
            onChange: handleWeightChange,
            required: true,
          },
          {
            label: "Stock",
            value: stock,
            onChange: handleStockChange,
            required: true,
          },
          {
            label: "Description",
            value: description,
            onChange: (e) => setDescription(e.target.value),
            as: "textarea",
          },
        ].map(
          (
            {
              label,
              type = "input",
              value,
              onChange,
              required,
              options,
              prefix,
              placeholder,
              as,
            },
            index
          ) => (
            <div key={index} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex gap-1">
                  <span>{label}</span>
                  {required && <span className="text-red-600">*</span>}
                </div>
              </label>
              {type === "select" ? (
                <select
                  value={value}
                  onChange={onChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark focus:border-primary-dark sm:text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {options &&
                    options.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              ) : as === "textarea" ? (
                <textarea
                  value={value}
                  onChange={onChange}
                  rows="4"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark focus:border-primary-dark sm:text-sm"
                />
              ) : (
                <div className="flex items-center relative">
                  {prefix && (
                    <span className="absolute px-2 border-r sm:text-sm mt-1">
                      {prefix}
                    </span>
                  )}
                  <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    className={`mt-1 block w-full ${
                      prefix ? "pl-11" : "pl-3"
                    } pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-dark focus:border-primary-dark sm:text-sm`}
                  />
                </div>
              )}
            </div>
          )
        )}

        {category && (
          <div>
            <label className="text-sm font-medium text-gray-700">
              <div className="flex gap-1">
                <span>Tags</span>
                <span className="text-red-600">*</span>
              </div>
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 items-end gap-2 mb-2">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center">
                  <input
                    type="checkbox"
                    id={tag}
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagChange(tag)}
                    className="mr-1 h-4 w-4 text-primary-light focus:ring-primary-dark border-gray-300 rounded"
                  />
                  <label
                    htmlFor={tag}
                    className="text-sm font-medium text-gray-700"
                  >
                    #{tag}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {errorMessage || error && (
          <p className="text-red-500 my-3 text-sm">{errorMessage || error}</p>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-md shadow-sm focus:outline-none"
          disabled={addProductLoading || editProductLoading}
        >
          <div className="flex items-center justify-center gap-2">
            {addProductLoading || editProductLoading && (
              <span className="animate-spin text-xl">
                <AiOutlineLoading />
              </span>
            )}
            <span>{productId ? "Update Product" : "Upload Product"}</span>
          </div>
        </button>
      </form>
    </div>
  );
};

export default ProductUpload;
