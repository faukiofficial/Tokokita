import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store/srote.js";
import { BrowserRouter } from "react-router-dom";
import {Toaster} from "react-hot-toast"

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
      <Toaster position="bottom-right" />
    </Provider>
  </BrowserRouter>
);
