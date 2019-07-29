import React from "react";
import { render } from "react-dom";
import { Router } from "react-router";
import { Route } from "react-router-dom";
import { createBrowserHistory } from "history";

import "firebase/database";

import { createStore } from "redux";
import { Provider } from "react-redux";
import allReducers from "./redux/reducers/reducers";

import Home from "./components/App";

const browserHistory = createBrowserHistory();
const store = createStore(allReducers);

render(
  <Provider store={store}>
    <Router history={browserHistory} path="/" component={Home}>
      <div>
        <Route path="/" component={Home} />
      </div>
    </Router>
  </Provider>,
  document.getElementById("root")
);
