import React, { useCallback, useState } from "react";
import { CustomModal } from "../../../../components/Modal/Modal";
import { Modal, Text } from "@shopify/polaris";
import { E_STATUS_PRODUCTS } from "../../../../graphql/products/products.interfaces";
import { useAuthenticatedFetch } from "../../../../hooks";
import { useToast } from "@shopify/app-bridge-react";
import { mutationProductStatus } from "../../requests";

interface I_Props {
  id: number;
  opened: boolean;
  onClose: () => void;
  refetch: () => Promise<any>;
  status: E_STATUS_PRODUCTS;
}

export const ArchiveModal = ({
  opened,
  id,
  onClose,
  refetch,
  status,
}: I_Props) => {
  const fetch = useAuthenticatedFetch();

  const { show: showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);

    try {
      await mutationProductStatus(fetch, `gid://shopify/Product/${id}`, status);
      await refetch();
      onClose();
    } catch (error) {
      // TODO: fix hardcode exception
      showToast(`Error during product change`, { isError: true });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return (
    <CustomModal
      title={status === "ARCHIVED" ? "Archive product?" : "Unarchive product?"}
      opened={opened}
      onClose={onClose}
      primaryAction={{
        loading: isLoading,
        content:
          status === "ARCHIVED" ? "Archive product" : "Unarchive product",
        onAction: handleSubmit,
      }}
      secondaryActions={[
        { disabled: isLoading, content: "Cancel", onAction: onClose },
      ]}
    >
      <Modal.Section>
        <Text as={"p"}>
          {status === "ARCHIVED"
            ? `Archiving this product will hide it from your sales channels and Shopify admin. You’ll find it
                        using the status filter in your product list.`
            : `Unarchiving this product will change its status to draft so you can work on it again.`}
        </Text>
      </Modal.Section>
    </CustomModal>
  );
};
