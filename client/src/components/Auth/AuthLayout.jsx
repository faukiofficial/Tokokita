import { Outlet, useNavigate } from "react-router-dom";

const AuthLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-100">
      <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center w-full absolute">
        <div className="flex items-center space-x-2">
          <div
            className="text-2xl font-bold  text-primary cursor-pointer"
            onClick={() => navigate("/shop/products")}
          >
            Tokokita
          </div>
        </div>
      </header>
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
