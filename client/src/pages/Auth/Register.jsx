import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AiOutlineLoading } from "react-icons/ai";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../store/auth-slice/authSlice";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { logoutLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = "Register - Shopping App";
  }, [location]);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      userName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Full name is required"),
      userName: Yup.string()
        .required("Username is required")
        .matches(
          /^[a-zA-Z0-9._]+$/,
          'Username can only contain letters, numbers, ".", and "_"'
        )
        .notOneOf([""], "Username cannot be empty")
        .test(
          "not-end-with-dot",
          "Username cannot end with a dot",
          (value) => !value || !value.endsWith(".")
        ),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      phoneNumber: Yup.string()
        .matches(
          /^\+\d{1,3}\d{9,}$/,
          'Phone number must start with "+" and followed by country code and number'
        )
        .required("Phone number is required"),
      password: Yup.string().required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    onSubmit: async (values) => {
      const result = await dispatch(registerUser(values));

      if (result.meta.requestStatus === "fulfilled") {
        formik.resetForm();
        navigate("/auth/login");
      }
    },
  });

  return (
    <div className="min-h-screen flex justify-center items-center mt-16">
      <div className="w-[500px] mx-auto p-5 border bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.fullName}
              className={`border px-3 py-2 w-full ${
                formik.touched.fullName && formik.errors.fullName
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.fullName && formik.errors.fullName && (
              <div className="text-red-500">{formik.errors.fullName}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2">Username</label>
            <input
              type="text"
              name="userName"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.userName}
              className={`border px-3 py-2 w-full ${
                formik.touched.userName && formik.errors.userName
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.userName && formik.errors.userName && (
              <div className="text-red-500">{formik.errors.userName}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={`border px-3 py-2 w-full ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500">{formik.errors.email}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-2">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phoneNumber}
              className={`border px-3 py-2 w-full ${
                formik.touched.phoneNumber && formik.errors.phoneNumber
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <div className="text-red-500">{formik.errors.phoneNumber}</div>
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
                className={`border px-3 py-2 w-full ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2"
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

          <div className="mb-6">
            <label className="block mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                className={`border px-3 py-2 w-full ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-2"
              >
                {showConfirmPassword ? (
                  <FaRegEyeSlash className="text-xl" />
                ) : (
                  <FaRegEye className="text-xl" />
                )}
              </button>
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <div className="text-red-500">
                  {formik.errors.confirmPassword}
                </div>
              )}
          </div>
          {error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white w-full py-2 rounded"
              disabled={logoutLoading}
            >
              <div className="flex items-center justify-center gap-2">
                {logoutLoading && (
                  <span className="animate-spin text-xl">
                    <AiOutlineLoading />
                  </span>
                )}
                <span>REGISTER</span>
              </div>
            </button>
          </div>
        </form>
        <p className="mt-5 text-sm">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-semibold hover:underline cursor-pointer"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
