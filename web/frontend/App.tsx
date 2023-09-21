import { NavigationMenu } from "@shopify/app-bridge-react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import Routes, { type Route } from "./Routes";
import ErrorBoundaryView from "./components/ErrorView";
import { GlobalLoadingIndicator } from "./components/GlobalLoadingIndicator";
import { ShopContextProvider } from "./hooks/index";
import { AppBridgeProvider, PolarisProvider, QueryProvider } from "./providers";

export default function App() {
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            FallbackComponent={ErrorBoundaryView}
            onReset={reset}
            onError={(error, info) => {
            }}
          >
            <BrowserRouter>
              <AppBridgeProvider>
                <QueryProvider>
                  <GlobalLoadingIndicator />
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
                      <Routes />
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
