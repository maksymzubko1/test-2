import { useIsFetching } from "@tanstack/react-query";
import { Spinner } from "@shopify/polaris";

export function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();

  return isFetching ? (
    <div
      style={{
        margin: "auto",
        background: "none",
        display: "inline-block",
        shapeRendering: "auto",
        position: "absolute",
        top: "4px",
        right: "4px",
        zIndex: 9999,
      }}
    >
      <Spinner accessibilityLabel="General loading indicator" size="small" />
    </div>
  ) : null;
}
