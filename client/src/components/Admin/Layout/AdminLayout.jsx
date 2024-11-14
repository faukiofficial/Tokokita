import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { SlLogout } from "react-icons/sl";
import { AiOutlineProduct } from "react-icons/ai";
import { IoBagAddOutline } from "react-icons/io5";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../store/auth-slice/authSlice";
import { AiOutlineLoading } from "react-icons/ai";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

const AdminLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, user } = useSelector((state) => state.auth);

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case "/admin/products":
        return "Products";
      case "/admin/add-product":
        return "Add Product";
      case "/admin/edit-product":
        return "Edit Product";
      case "/admin/orders":
        return "Orders";
      case "/admin/admin-profile":
        return "Admin Profile";
      default:
        return "";
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const navLinks = [
    {
      to: "products",
      label: "Products",
      icon: <AiOutlineProduct className="text-xl" />,
    },
    {
      to: "add-product",
      label: "Add Product",
      icon: <IoBagAddOutline className="text-xl" />,
    },
    {
      to: "orders",
      label: "Orders",
      icon: <AiOutlineShoppingCart className="text-xl" />,
    },
    {
      label: "Store Setting",
      icon: <IoSettingsOutline className="text-xl" />,
      subMenu: [
        {
          to: "admin-profile",
          label: "Admin Profile",
        },
        {
          to: "store-profile",
          label: "Store Profile",
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
      to: "add-product",
      icon: <IoBagAddOutline className="text-xl" />,
    },
    {
      to: "store-profile",
      icon: <IoSettingsOutline className="text-xl" />,
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

  const userAvatarLink = `https://avatar.iran.liara.run/username?username=${getFirstTwoWords(
    user.fullName
  )}&background=f4d9b2&color=FF9800`;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <Link
            to="/admin/products"
            className="text-2xl font-bold cursor-pointer text-primary"
          >
            Tokokita
          </Link>
          <div className="lg:flex items-center space-x-2 hidden">
            <span className="text-gray-500">/</span>
            <div className="text-lg text-gray-700">Admin Dashboard</div>
            <span className="text-gray-500">/</span>
            <div className="text-lg text-gray-700">{getBreadcrumb()}</div>
          </div>
        </div>
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => navigate("/admin/admin-profile")}
        >
          <img
            src={user.profilePicture?.url || userAvatarLink}
            alt={user.fullName}
            width={35}
            height={35}
            className="rounded-full"
            style={{ objectFit: "cover", aspectRatio: "1/1" }}
          />
          <div className="flex flex-col">
            <span className="hover:underline">{user.fullName}</span>
            {user.role === "admin" && (
              <span className="bg-slate-100 border rounded-full text-sm w-[3.5rem] text-center">
                Admin
              </span>
            )}
          </div>
        </div>
      </header>

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
                        <div className="flex items-center gap-2">
                          {icon}
                          {label}
                        </div>
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
          <button
            className="block py-2 px-4 hover:bg-primary-light"
            onClick={handleLogout}
          >
            <div className="flex items-center justify-center gap-2">
              <IoIosLogOut className="text-2xl" />
            </div>
          </button>
        </nav>
      </header>
    </div>
  );
};

export default AdminLayout;
