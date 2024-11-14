import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { MdNavigateNext } from "react-icons/md";
import { MdNavigateBefore } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { categories } from "../../data/CategriesAndTags";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProduct,
} from "../../store/productSlice/productSlice";
import ShoppingProduct from "../../components/Shop/Home/ShoppingProduct";
import { addToCart } from "../../store/cartSlice/cartSlice";

const ShoppingHome = () => {
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

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isLoading,
    allproducts,
    totalProducts,
  } = useSelector((state) => state.product);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.title = "Home | Shopping App";
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

  const handleCategoryChange = (e) => {
    const queryParams = new URLSearchParams(location.search);
    setSelectedCategory(e.target.value);
    setPage(1);
    queryParams.set("page", 1);
    navigate({ search: queryParams.toString() });
  };

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

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePageChange = (newPage) => {
    const queryParams = new URLSearchParams(location.search);
    setPage(newPage);
    queryParams.set("page", newPage);
    queryParams.set("limit", limit);
    navigate({ search: queryParams.toString() });
  };

  const handleLimitChange = (e) => {
    const queryParams = new URLSearchParams(location.search);
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setPage(1);
    queryParams.set("limit", newLimit);
    queryParams.set("page", 1); 
    navigate({ search: queryParams.toString() });
  };

   const handleAddToCart = (productId, quantity = 1) => {
      dispatch(addToCart({ productId, quantity }));
  };
  

  return (
    <div className="mx-auto lg:py-4 lg:px-5 xl:px-10 bg-white min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between lg:mb-4 p-2">
        <h1 className="text-xl font-bold mb-2 lg:mb-0">
          Product List
        </h1>
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

        </div>
      </div>

      {isLoading ? (
        <div className="text-center">
          <Skeleton count={3} height={100} width="100%" />
        </div>
      ) : (
        <div>
          <ShoppingProduct
            sortProducts={sortProducts}
            sortedProducts={sortedProducts}
            sortConfig={sortConfig}
            setSortField={setSortField}
            setSortDirection={setSortDirection}
            formatNumber={formatNumber}
            handleAddToCart={handleAddToCart}
          />

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
              <MdNavigateNext className="" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingHome;
