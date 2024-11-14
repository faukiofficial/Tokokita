import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { SlLogout } from "react-icons/sl";
import { AiOutlineProduct } from "react-icons/ai";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { IoIosLogOut } from "react-icons/io";
import { SlLogin } from "react-icons/sl";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../store/auth-slice/authSlice";
import { AiOutlineLoading } from "react-icons/ai";
import { IoCartOutline } from "react-icons/io5";
import { VscAccount } from "react-icons/vsc";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";
import { MdOutlineLocalShipping } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import {
  getCart,
  updateCartItem,
  removeFromCart,
} from "../../../store/cartSlice/cartSlice";
import "./../../../styles/style.css";
import Cart from "../Cart/Cart";

const ShopLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef(null);
  const [inputValues, setInputValues] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedTotal, setSelectedTotal] = useState(0);

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, user } = useSelector((state) => state.auth);
  const {
    cart,
    isUpdating: addTocartLoading,
    isQuantityUpdateting,
    isRemoving,
    updatingItemId,
    removingItemId,
  } = useSelector((state) => state.cart);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleClickOutside = (event) => {
    if (cartRef.current && !cartRef.current.contains(event.target)) {
      setIsCartOpen(false);
      setSelectedItems({});
      setSelectedTotal(0);
      setInputValues({});
    }
  };

  useEffect(() => {
    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartOpen]);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const handleRemoveFromCart = (productId) => {
    dispatch(removeFromCart({ productId }));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    dispatch(updateCartItem({ productId, quantity: newQuantity })).then(
      () => {
        if (selectedItems[productId] && selectedItems[productId].length > 0) {
          setSelectedTotal((prevTotal) => {
            const updatedItem = cart.items.find(
              (item) => item.product._id === productId
            );
            const oldQuantity = updatedItem?.quantity || 1;
            const newTotal =
              prevTotal -
              updatedItem.product.salePrice * oldQuantity +
              updatedItem.product.salePrice * newQuantity;
            return newTotal;
          });
        }
      }
    );
  };

  const handleKeyDown = (e, productId) => {
    if (e.key === "Enter") {
      const newValue = inputValues[productId]?.trim();
      if (newValue === "" || parseInt(newValue) <= 0) {
        handleRemoveFromCart(productId);
      } else {
        handleUpdateQuantity(productId, Math.max(parseInt(newValue), 1));
      }
      setInputValues((prev) => ({
        ...prev,
        [productId]: "",
      }));
    }
  };

  const handleSelectItem = (productId, quantity) => {
    setSelectedItems((prev) => {
      const isSelected = prev[productId];

      const newSelectedItems = isSelected
        ? { ...prev, [productId]: undefined }
        : { ...prev, [productId]: quantity };

      const total = cart.items.reduce((sum, item) => {
        if (newSelectedItems[item.product._id]) {
          return (
            sum + item.product.salePrice * newSelectedItems[item.product._id]
          );
        }
        return sum;
      }, 0);

      setSelectedTotal(total);
      return newSelectedItems;
    });
  };

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case "/shop/products":
        return "Products";
      case "/shop/my-orders":
        return "My Orders";
      case "/shop/my-profile":
        return "My Profile";
      case "/shop/checkout":
        return "Checkout";
      default:
        return "";
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    window.location.href = "/auth/login";
  };

  const navLinks = [
    {
      to: "products",
      label: "Products",
      icon: <AiOutlineProduct className="text-xl" />,
    },
    {
      to: "my-orders",
      label: "My Orders",
      icon: <AiOutlineShoppingCart className="text-xl" />,
    },
    {
      label: "My Account",
      icon: <VscAccount className="text-xl" />,
      subMenu: [
        {
          to: "my-profile",
          label: "Profile",
        },
        {
          to: "my-address",
          label: "Address",
        },
      ],
    },
  ];

  const navLinksMobile = [
    {
      to: "products",
      icon: <AiOutlineProduct className="text-xl" />,
    },
    {
      to: "my-orders",
      icon: <AiOutlineShoppingCart className="text-xl" />,
    },
    {
      to: "my-profile",
      icon: <VscAccount className="text-xl" />,
    },
    {
      to: "my-address",
      icon: <MdOutlineLocalShipping className="text-xl" />,
    },
  ];

  const renderSubMenu = (subMenu) => {
    return subMenu.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `block py-2 px-4 w-full ${
            isActive
              ? "text-primary font-bold"
              : "hover:text-primary hover:underline"
          }`
        }
      >
        {item.label}
      </NavLink>
    ));
  };

  function getFirstTwoWords(sentence) {
    const words = sentence.split(" ");
    return words.slice(0, 2).join("+");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-end sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <Link
            to="/shop/products"
            className="text-2xl font-bold cursor-pointer text-primary"
          >
            Tokokita
          </Link>
          <div className="lg:flex items-center space-x-2 hidden">
            <span className="text-gray-500">/</span>
            <div className="text-lg text-gray-700">Shopping Page</div>
            <span className="text-gray-500">/</span>
            <div className="text-lg text-gray-700">{getBreadcrumb()}</div>
          </div>
        </div>
        {user ? (
          <div className="flex items-center gap-8">
            {location.pathname !== "/shop/checkout" && location.pathname !== "/shop/payment" && (
              <div className="relative cursor-pointer">
                <IoCartOutline className="text-3xl" onClick={toggleCart} />
                <span
                  className="bg-primary text-white px-[4px] text-[12px] rounded-full absolute -top-1 left-5"
                  onClick={toggleCart}
                >
                  {addTocartLoading ? (
                    <AiOutlineLoading className="text-[1rem] py-[3px] animate-spin" />
                  ) : (
                    cart?.items?.length
                  )}
                </span>
                {isCartOpen && (
                  <div className="bg-slate-500 w-10 h-10 absolute -top-1 opacity-0"></div>
                )}
              </div>
            )}

            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => navigate("/shop/my-profile")}
            >
              <img
                src={
                  user.profilePicture?.url ||
                  `https://avatar.iran.liara.run/username?username=${getFirstTwoWords(
                    user?.fullName
                  )}&background=f4d9b2&color=FF9800`
                }
                alt={user.fullName}
                width={35}
                height={35}
                className="rounded-full"
                style={{ objectFit: "cover", aspectRatio: "1/1" }}
              />
              <div className="flex flex-col">
                <span
                  className={`hover:underline ${
                    user?.role === "user" ? "hidden md:block" : ""
                  }`}
                >
                  {user?.fullName}
                </span>
                {user?.role === "admin" && (
                  <span className="bg-slate-100 border rounded-full text-sm w-[3.5rem] text-center">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <button
            className="hover:bg-red-100 border border-red-500 px-6 py-1 rounded"
            onClick={() => (window.location.href = "/auth/login")}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="font-semibold">LOGIN</span>{" "}
              <SlLogin className="transform scale-x-[-1]" />
            </div>
          </button>
        )}
      </header>

      <Cart
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cartRef={cartRef}
        cart={cart}
        selectedItemsFK={selectedItems}
        setSelectedItems={setSelectedItems}
        setSelectedTotal={setSelectedTotal}
        handleSelectItem={handleSelectItem}
        handleRemoveFromCart={handleRemoveFromCart}
        handleUpdateQuantity={handleUpdateQuantity}
        isQuantityUpdateting={isQuantityUpdateting}
        updatingItemId={updatingItemId}
        inputValues={inputValues}
        setInputValues={setInputValues}
        handleKeyDown={handleKeyDown}
        isRemoving={isRemoving}
        removingItemId={removingItemId}
        selectedTotal={selectedTotal}
      />

      <div className="flex">
        <aside className="hidden fixed z-10 min-w-[180px] bg-white text-black border min-h-screen lg:flex flex-col justify-between pb-[80px]">
          <nav className="mt-6">
            {navLinks.map(({ to, label, icon, subMenu }) => {
              const isSubMenuActive =
                subMenu &&
                subMenu.some((item) => location.pathname.includes(item.to));

              return (
                <div key={label} className="relative group">
                  <div className="flex items-center justify-between cursor-pointer hover:bg-primary-light">
                    {to ? (
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          `flex items-center gap-2 py-2 px-2 w-full ${
                            isActive
                              ? "bg-primary-light border-l-4 border-primary-dark"
                              : "hover:bg-primary-light"
                          }`
                        }
                      >
                        {icon}
                        {label}
                      </NavLink>
                    ) : (
                      <div className="flex items-center gap-2 py-2 px-2 w-full">
                        {icon}
                        {label}
                      </div>
                    )}

                    {subMenu && (
                      <span className="text-lg mr-2">
                        <span
                          className={`${
                            isSubMenuActive ? "hidden" : "group-hover:hidden"
                          }`}
                        >
                          <FaAngleDown />
                        </span>
                        <span
                          className={`${
                            isSubMenuActive
                              ? "inline"
                              : "hidden group-hover:inline"
                          }`}
                        >
                          <FaAngleUp />
                        </span>
                      </span>
                    )}
                  </div>

                  {subMenu && (
                    <div
                      className={`${
                        isSubMenuActive ? "block" : "hidden group-hover:block"
                      } w-full bg-white shadow-sm`}
                    >
                      {renderSubMenu(subMenu)}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {user ? (
            <button
              className="hover:bg-red-100 border border-red-500 px-2 py-1 rounded mx-4"
              onClick={handleLogout}
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading && (
                  <span className="animate-spin text-xl">
                    <AiOutlineLoading />
                  </span>
                )}
                <SlLogout className="text-lg" />
                <span className="font-semibold">LOGOUT</span>
              </div>
            </button>
          ) : null}
        </aside>

        <main className="lg:ml-[11rem] p-2 lg:p-6 pb-[3rem] lg-pb-0 w-full">
          <Outlet />
        </main>
      </div>
      <header className="lg:hidden border-t bg-white shadow-b-sm px-6 fixed bottom-0 z-20 w-full">
        <nav className="flex items-center justify-around">
          {navLinksMobile.map(({ to, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block py-2 px-4 ${
                  isActive
                    ? "bg-primary-light border-b-4 border-primary-dark"
                    : "hover:bg-primary-light"
                }`
              }
            >
              <div>{icon}</div>
            </NavLink>
          ))}
          {user && (
            <button
              className="block py-2 px-4 hover:bg-primary-light"
              onClick={handleLogout}
            >
              <div className="flex items-center justify-center gap-2">
                <IoIosLogOut className="text-2xl" />
              </div>
            </button>
          )}
        </nav>
      </header>
    </div>
  );
};

export default ShopLayout;
