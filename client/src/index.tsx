import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { store } from "./store/store";
import { getToken } from "./utils/HelperFunctions";
import { Provider } from "react-redux";
import { fetchInitialState, login } from "./store/slices/authSlice";
import { authorizeAxiosInstance } from "./network/api/apiClient";

const accessToken = getToken();

if (accessToken) {
  authorizeAxiosInstance(accessToken);
  store.dispatch(fetchInitialState(accessToken));
  store.dispatch(login(accessToken));
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
