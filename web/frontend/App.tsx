import {NavigationMenu} from "@shopify/app-bridge-react";
import {QueryErrorResetBoundary} from "@tanstack/react-query";
import {ErrorBoundary} from "react-error-boundary";
import {HelmetProvider} from "react-helmet-async";
import {BrowserRouter} from "react-router-dom";
import Routes from "./Routes";
import ErrorBoundaryView from "./components/ErrorView";
import {GlobalLoadingIndicator} from "./components/GlobalLoadingIndicator";
import {ShopContextProvider} from "./hooks";
import {AppBridgeProvider, PolarisProvider, QueryProvider} from "./providers";

export default function App() {
    return (
        <PolarisProvider>
            <QueryErrorResetBoundary>
                {({reset}) => (
                    <ErrorBoundary
                        FallbackComponent={ErrorBoundaryView}
                        onReset={reset}
                        onError={() => {
                        }}
                    >
                        <BrowserRouter>
                            <AppBridgeProvider>
                                <QueryProvider>
                                    <GlobalLoadingIndicator/>
                                    <ShopContextProvider>
                                        <HelmetProvider>
                                            <NavigationMenu
                                                navigationLinks={[
                                                    {
                                                        label: "Settings",
                                                        destination: "/settings",
                                                    },
                                                ]}
                                            />
                                            <Routes/>
                                        </HelmetProvider>
                                    </ShopContextProvider>
                                </QueryProvider>
                            </AppBridgeProvider>
                        </BrowserRouter>
                    </ErrorBoundary>
                )}
            </QueryErrorResetBoundary>
        </PolarisProvider>
    );
}
