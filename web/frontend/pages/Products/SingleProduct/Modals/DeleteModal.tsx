import React, { useCallback, useState } from "react";
import { Modal, Text } from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { useAuthenticatedFetch } from "../../../../hooks";
import { CustomModal } from "../../../../components/Modal/Modal";
import { E_Routes } from "../../../../Routes";
import { useToast } from "@shopify/app-bridge-react";
import { mutationProductDelete } from "../../requests";

interface I_Props {
  id: number;
  opened: boolean;
  onClose: () => void;
  title: string;
}

export const DeleteModal = ({ title, opened, id, onClose }: I_Props) => {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const { show: showToast } = useToast();

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);

    try {
      await mutationProductDelete(fetch, String(id));
      onClose();
      navigate(E_Routes.products);
    } catch (error) {
      // TODO: fix hardcode exception
      showToast(`Error during product delete`, { isError: true });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return (
    <CustomModal
      title={`Delete product ${title}?`}
      opened={opened}
      onClose={onClose}
      primaryAction={{
        loading: isLoading,
        content: "Delete product",
        onAction: handleSubmit,
        destructive: true,
      }}
      secondaryActions={[
        { disabled: isLoading, content: "Cancel", onAction: onClose },
      ]}
    >
      <Modal.Section>
        <Text as={"p"}>
          {`Are you sure you want to delete the product ${title}? This can’t be
                        undone.`}
        </Text>
      </Modal.Section>
    </CustomModal>
  );
};
