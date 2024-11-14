import { FaSortUp } from "react-icons/fa6";
import { FaSortDown } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";
import "../../../styles/style.css";

const columns = [
  { key: "title", label: "Product" },
  { key: "salePrice", label: "Price" },
  { key: "stock", label: "Stock" },
  { key: "sold", label: "Sold" },
  { key: "createdAt", label: "Upload", hiddenOnSmall: true },
];

const ProductTableDesktop = ({
  sortProducts,
  sortedProducts,
  sortConfig,
  setSortField,
  setSortDirection,
  handleDeleteClick,
  formatNumber,
}) => {
  return (
    <div className="overflow-x-auto hidden lg:block">
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
          {columns.map(({ key, label, hiddenOnSmall }) => (
              <th
                key={key}
                className={`border px-2 py-2 cursor-pointer ${
                  hiddenOnSmall ? "hidden xl:block" : ""
                }`}
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
                <div className="flex gap-1 items-center justify-center">
                  <div>{label}</div>
                  <div className="flex flex-col">
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
              </th>
            ))}

            <th className="border px-2 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map((product) => (
            <tr key={product._id}>
              <td className="flex gap-2 border px-4 py-2">
                <div className="h-20 w-20 min-w-20 relative bg-white rounded-md border border-gray-300">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-clamp leading-tight">
                    {product.title}
                  </span>
                  <span className="text-[13px]">
                    Category: {product.category}
                  </span>
                </div>
              </td>
              <td className="border px-1 py-2">
                <div className="flex gap-1 justify-center">
                  <span className="text-sm font-semibold flex items-end">
                    Rp.
                  </span>{" "}
                  <span>
                    {formatNumber(
                      `${product.salePrice}`
                    )}
                  </span>
                </div>
              </td>
              <td className="border px-1 py-2">
                <div className="flex justify-center">
                  {formatNumber(product.stock)}
                </div>
              </td>
              <td className="border px-1 py-2">
                <div className="flex justify-center">{product.sold}</div>
              </td>
              <td className="border px-1 py-2 hidden xl:table-cell">
                <div className="flex justify-center">
                  {new Date(product.createdAt).toLocaleDateString("id-ID")}
                </div>
              </td>
              <td className="border">
                <div className="flex flex-col xl:flex-row items-center justify-center gap-2">
                  <button
                    className="border border-primary-dark hover:bg-primary-light text-primary-dark hover:text-black px-3 py-1 rounded text-xl"
                    onClick={() =>
                      (window.location.href = `/admin/edit-product?id=${product._id}`)
                    }
                  >
                    <CiEdit />
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xl"
                    onClick={() => handleDeleteClick(product)}
                  >
                    <MdDeleteOutline />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTableDesktop;
