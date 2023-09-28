import { Routes as ReactRouterRoutes, Route } from "react-router-dom";
import { ComponentType } from "react";
import NotFound from "./pages/NotFound";
import { MainLayout } from "./layouts/Main";
import { Home } from "./pages/Home/Home";
import { Orders } from "./pages/Orders/Orders";
import Settings from "./pages/settings";
import { SingleOrder } from "./pages/Orders/SingleOrder/SingleOrder";
import { Products } from "./pages/Products/Products";
import { UpdateSingleProduct } from "./pages/Products/SingleProduct/UpdateSingleProduct";
import { CreateSingleProduct } from "./pages/Products/SingleProduct/CreateSingleProduct";

export type Route = {
  [key: string]: ComponentType;
};

export enum E_Routes {
  home = "/",
  orders = "/orders",
  products = "/products",
}

export default function Routes(): JSX.Element {
  return (
    <ReactRouterRoutes>
      <Route path={"/"} element={<MainLayout />}>
        <Route path={"/"} element={<Home />} />
        <Route path={"/orders"} element={<Orders />} />
        <Route path={"/products"} element={<Products />} />
        <Route path={"/orders/:id"} element={<SingleOrder />} />
        <Route path={"/products/:id"} element={<UpdateSingleProduct />} />
        <Route path={"/products/new"} element={<CreateSingleProduct />} />
      </Route>
      <Route path={"/settings"} element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </ReactRouterRoutes>
  );
}
