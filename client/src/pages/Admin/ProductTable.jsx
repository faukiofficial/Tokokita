import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import ProductTableMobile from "../../components/Admin/Product/ProductTableMobile";
import ProductTableDesktop from "../../components/Admin/Product/ProductTableDesktop";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useLocation, useNavigate } from "react-router-dom";
import { categories } from "../../data/CategriesAndTags";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { IoMdAdd } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteProductById,
  getAllProduct,
} from "../../store/productSlice/productSlice";

const ProductTable = () => {
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [sortedProducts, setSortedProducts] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [error, setError] = useState("");
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isLoading,
    errorMessage,
    successMessage,
    allproducts,
    isDeleteLoading,
    totalProducts,
  } = useSelector((state) => state.product);

  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.title = "Admin Products - Shopping App";
  }, [location]);

  useEffect(() => {
    dispatch(
      getAllProduct({
        searchQuery,
        selectedCategory,
        sortField,
        sortDirection,
        limit,
        page,
      })
    );
  }, [
    dispatch,
    searchQuery,
    selectedCategory,
    sortField,
    sortDirection,
    limit,
    page,
  ]);

  useEffect(() => {
    if (allproducts) {
      setSortedProducts(allproducts);
      setTotalPages(Math.ceil(totalProducts / limit));
    }
  }, [allproducts, limit, totalProducts]);

  // Pagination Controls
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const queryPage = queryParams.get("page");
    const queryLimit = queryParams.get("limit");
    if (queryLimit) {
      const parsedLimit = parseInt(queryLimit, 10);
      if (!isNaN(parsedLimit)) {
        setLimit(parsedLimit);
      }
    }
    if (queryPage) {
      const parsedPage = parseInt(queryPage, 10);
      if (!isNaN(parsedPage) && parsedPage >= 1) {
        setPage(parsedPage);
      } else {
        setPage(1);
      }
    } else {
      setPage(1);
    }
  }, [location.search]);

  // Fungsi Search
  const handleSearch = () => {
    const queryParams = new URLSearchParams(location.search);
    setSearchQuery(search);
    setPage(1);
    queryParams.set("page", 1);
    navigate({ search: queryParams.toString() });
  };

  useEffect(() => {
    if (search === "") {
      setSearchQuery("");
    }
  }, [search]);

  // Fungsi untuk mengubah kategori
  const handleCategoryChange = (e) => {
    const queryParams = new URLSearchParams(location.search);
    setSelectedCategory(e.target.value);
    setPage(1);
    queryParams.set("page", 1);
    navigate({ search: queryParams.toString() });
  };

  // Sorting function
  const sortProducts = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sorted = [...sortedProducts].sort((a, b) => {
      if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
      if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
      return 0;
    });

    setSortedProducts(sorted);
    setTotalPages(Math.ceil(sorted.length / limit));
  };

  // Fungsi untuk menambahkan titik pada angka
  const formatNumber = (num) => {
    if (num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
  };

  // Delete Product
  const deleteProduct = async (productId) => {
    if (!isAuthenticated) {
      setError("Anda tidak memiliki akses untuk menghapus produk.");
      return;
    }
    try {
      dispatch(deleteProductById({ productId }));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  useEffect(() => {
    if (successMessage) {
      setShowConfirm(false);
      setProductToDelete(null);
    }
  }, [successMessage]);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    deleteProduct(productToDelete._id);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setProductToDelete(null);
  };

  // Fungsi untuk pindah halaman melalui tombol
  const handlePageChange = (newPage) => {
    const queryParams = new URLSearchParams(location.search);
    setPage(newPage);
    queryParams.set("page", newPage);
    queryParams.set("limit", limit);
    navigate({ search: queryParams.toString() });
  };

  // Fungsi untuk mengubah limit
  const handleLimitChange = (e) => {
    const queryParams = new URLSearchParams(location.search);
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setPage(1);
    queryParams.set("limit", newLimit);
    queryParams.set("page", 1);
    navigate({ search: queryParams.toString() });
  };

  return (
    <div className="mx-auto lg:py-4 lg:px-5 xl:px-10 bg-white min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between lg:mb-4 p-2">
        <h1 className="text-xl font-bold mb-2 lg:mb-0">
          Product List ({totalProducts})
        </h1>
        {/* Input Search */}
        <div className="flex items-center relative mb-3 lg:mb-0">
          <input
            type="text"
            placeholder="Search product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border pl-2 pr-[55px] py-1 lg:py-2 rounded border-primary-dark w-full xl:w-[400px] focus:outline-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button
            onClick={() => handleSearch()}
            className="bg-primary hover:bg-primary-hover text-white px-1 lg:px-3 lg:py-1 text-2xl rounded-r border-2 border-primary absolute right-0"
          >
            <IoSearchOutline />
          </button>
        </div>
        <div className="flex gap-4 items-center justify-between mb-2 lg:mb-0 lg:md-0">
          {/* Dropdown untuk filter kategori */}
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="border px-2 py-1 lg:py-2 rounded border-primary-dark focus:outline-none text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <button
            className="bg-primary hover:bg-primary-hover text-white lg:px-2 lg:py-1 rounded border-2 border-primary"
            onClick={() => (window.location.href = `/admin/add-product`)}
          >
            <div className="flex items-center justify-center gap-1 p-1 px-2 lg:px-0">
              <IoMdAdd className="text-xl" />{" "}
              <span className="hidden lg:block text-sm">Add Product</span>
            </div>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">
          <Skeleton count={3} height={100} width="100%" />
        </div>
      ) : (
        <div>
          <ProductTableMobile
            sortProducts={sortProducts}
            sortedProducts={sortedProducts}
            sortConfig={sortConfig}
            setSortField={setSortField}
            setSortDirection={setSortDirection}
            handleDeleteClick={handleDeleteClick}
            formatNumber={formatNumber}
          />
          <ProductTableDesktop
            sortProducts={sortProducts}
            sortConfig={sortConfig}
            sortedProducts={sortedProducts}
            formatNumber={formatNumber}
            handleDeleteClick={handleDeleteClick}
            setSortDirection={setSortDirection}
            setSortField={setSortField}
          />

          {/* Pagination Controls */}
          <div className="lg:mt-2 flex justify-end items-center gap-2 p-2 lg:p-0">
            <select
              value={limit}
              onChange={handleLimitChange}
              className="border p-[2px] rounded focus:outline-none text-sm"
            >
              <option value="10">10 / page</option>
              <option value="16">16 / page</option>
              <option value="20">20 / page</option>
            </select>
            <button
              className={`bg-white hover:text-blue-500 text-black border rounded-[3px] px-2 py-1 disabled:text-slate-600 ${
                page > 1 ? "cursor-pointer" : ""
              }`}
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <MdNavigateBefore />
            </button>
            <span className="text-gray-700 flex items-center">
              {page} / {totalPages}
            </span>
            <button
              className={`bg-white hover:text-blue-500 text-black border rounded-[3px] px-2 py-1 disabled:text-slate-600 ${
                totalPages >= page ? "" : "cursor-pointer"
              }`}
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <MdNavigateNext />
            </button>
          </div>
        </div>
      )}
      {/* Modal Konfirmasi Hapus */}
      <ConfirmationModal
        showConfirm={showConfirm}
        cancelDelete={cancelDelete}
        confirmDelete={confirmDelete}
        deleteLoading={isDeleteLoading}
        productToDelete={productToDelete}
        errorMessage={error || errorMessage}
        setErrorMessage={setError}
      />
    </div>
  );
};

export default ProductTable;
