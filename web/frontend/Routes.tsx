import {Routes as ReactRouterRoutes, Route} from "react-router-dom";
import {ComponentType} from "react";
import NotFound from "./pages/NotFound";
import {MainLayout} from "./layouts/Main";
import PageGeneral from "./pages/PageGeneral";
import {Home} from "./pages/Home/Home";
import {Orders} from "./pages/Orders/Orders";

export type Route = {
    [key: string]: ComponentType;
};
type Pages = Record<string, Route>;

export default function Routes(): JSX.Element {
    return (
        <ReactRouterRoutes>
            <Route path={"/"} element={<MainLayout/>}>
                <Route path={"/"} element={<Home/>}/>
                <Route path={"/orders"} element={<Orders/>}/>
            </Route>
            <Route path="*" element={<NotFound/>}/>
        </ReactRouterRoutes>
    );
}
