import RefreshRuntime from "/@react-refresh";

RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {
  /* do nothing */
};
window.$RefreshSig$ = () => (type) => type;
window.__vite_plugin_react_preamble_installed__ = true;
