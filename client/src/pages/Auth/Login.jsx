import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AiOutlineLoading } from "react-icons/ai";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../store/auth-slice/authSlice";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error, user, isAuthenticated } = useSelector((state) => state.auth);

  console.log('login user', user)
  console.log('auth login', isAuthenticated)

  useEffect(() => {
    document.title = "Login - Shopping App";

    if (user && user.role === "admin") {
      navigate("/admin/products");
    } else if (user) {
      navigate("/shop/home");
    }
  }, [location, user, navigate]);

  const formik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
    },
    validationSchema: Yup.object({
      identifier: Yup.string()
        .required("Email or Username is required")
        .matches(/^[a-zA-Z0-9._@]+$/, "Must be a valid email or username"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: (values) => {
      dispatch(loginUser(values));
    },
  });

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-[500px] mx-auto p-5 border bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Email or Username</label>
            <input
              type="text"
              name="identifier"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.identifier}
              className={`border px-3 py-2 w-full focus:outline-none ${
                formik.touched.identifier && formik.errors.identifier
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.identifier && formik.errors.identifier && (
              <div className="text-red-500">{formik.errors.identifier}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className={`border pl-3 pr-9 py-2 w-full focus:outline-none ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? (
                  <FaRegEyeSlash className="text-xl" />
                ) : (
                  <FaRegEye className="text-xl" />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500">{formik.errors.password}</div>
            )}
          </div>
          {error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white w-full py-2 rounded"
              disabled={isLoading}
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading && (
                  <span className="animate-spin text-xl">
                    <AiOutlineLoading />
                  </span>
                )}
                <span>LOGIN</span>
              </div>
            </button>
          </div>
        </form>
        <div className="flex items-center justify-between">
          <p className="mt-5 text-sm">
            Don{`'`}t have an account?{" "}
            <Link
              to="/auth/register"
              className="font-semibold hover:underline cursor-pointer"
            >
              Register
            </Link>
          </p>
          <p className="mt-5 text-sm">
            <Link
              to="/auth/forget-password"
              className="font-semibold hover:underline cursor-pointer"
            >
              Forget Password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
