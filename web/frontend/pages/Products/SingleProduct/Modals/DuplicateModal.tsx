import React, { useCallback, useEffect, useState } from "react";
import {
  ChoiceList,
  Divider,
  Modal,
  TextField,
  VerticalStack,
} from "@shopify/polaris";
import {
  parseValidationResult,
  validateStatus,
  validateTitle,
} from "../../validators";
import { E_STATUS_PRODUCTS } from "../../../../graphql/products/products.interfaces";
import { useNavigate } from "react-router-dom";
import { useAuthenticatedFetch } from "../../../../hooks";
import { CustomModal } from "../../../../components/Modal/Modal";
import { shopifyIdToNumber } from "../../../../utils/shopifyIdToNumber";
import { useToast } from "@shopify/app-bridge-react";
import { mutationProductDuplicate } from "../../requests";

interface I_Props {
  title: string;
  status: string;
  id: number;
  opened: boolean;
  onClose: () => void;
}

export const DuplicateModal = ({
  title,
  status,
  id,
  onClose,
  opened,
}: I_Props) => {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);
  const [newTitle, setNewTitle] = useState<string>(`Copy of ${title}`);
  const [errors, setErrors] = useState<{[p: string]: {message: string}}>(null);
  const [newStatus, setNewStatus] = useState<string[]>([
    status === "ACTIVE" ? "ACTIVE" : "DRAFT",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { show: showToast } = useToast();

  useEffect(() => {
    setNewTitle(`Copy of ${title}`);
    setNewStatus([status === "ACTIVE" ? "ACTIVE" : "DRAFT"]);
  }, [title, status, id]);

  const handleStatus = useCallback(
    (value: string[]) => setNewStatus(value),
    []
  );

  const handleSelectedDetails = useCallback(
    (value: string[]) => setSelectedDetails(value),
    []
  );

  const handleNewTitle = useCallback((value: string) => setNewTitle(value), []);

  const handleClose = () => {
    onClose();
    handleSelectedDetails([]);
    handleNewTitle(`Copy of ${title}`);
    handleStatus([status === "ACTIVE" ? "ACTIVE" : "DRAFT"]);
  };

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);

    const errors = [validateTitle(newTitle), validateStatus(newStatus[0])];

    const getParsedErrors = parseValidationResult(errors);

    if (Object.keys(getParsedErrors).length) {
      setErrors(getParsedErrors);
      setIsLoading(false);
      return;
    }

    try {
      const data = {
        productId: `gid://shopify/Product/${id}`,
        newStatus: newStatus[0] as E_STATUS_PRODUCTS,
        newTitle,
        copyImages: selectedDetails.includes("images"),
      };
      const response = await mutationProductDuplicate(fetch, data);
      const productId = response.data.productDuplicate.newProduct.id;

      onClose();
      navigate(`/products/${shopifyIdToNumber(productId)}`);
    } catch (error) {
      // TODO: fix hardcode exception
      showToast(`Error during product duplicate`, { isError: true });
    } finally {
      setIsLoading(false);
    }
  }, [newTitle, newStatus]);

  useEffect(() => {
    if (errors && errors?.title) {
      setErrors((prev)=>{
        const {title, ...rest} = prev;
        return rest;
      });
    }
  }, [newTitle]);

  useEffect(() => {
    if (errors && errors?.status) {
      setErrors((prev)=>{
        const {status, ...rest} = prev;
        return rest;
      });
    }
  }, [newStatus]);

  return (
    <CustomModal
      title={"Duplicate product"}
      primaryAction={{
        loading: isLoading,
        content: "Duplicate product",
        onAction: handleSubmit,
      }}
      secondaryActions={[
        { disabled: isLoading, content: "Cancel", onAction: handleClose },
      ]}
      opened={opened}
      onClose={onClose}
    >
      <Modal.Section>
        <VerticalStack gap={"3"}>
          <TextField
            requiredIndicator
            label={"Title"}
            autoComplete={"off"}
            value={newTitle}
            onChange={handleNewTitle}
            error={errors?.title?.message}
          />
          <Divider />
          <ChoiceList
            title="Select details to copy. All other details except 3D models and videos will be copied from the original product and any variants."
            choices={[{ label: "Images", value: "images" }]}
            allowMultiple
            selected={selectedDetails}
            onChange={handleSelectedDetails}
          />
          <Divider />
          <ChoiceList
            title="Product status"
            choices={[
              {
                label: `Set as ${E_STATUS_PRODUCTS.draft.toLowerCase()}`,
                value: E_STATUS_PRODUCTS.draft,
              },
              {
                label: `Set as ${E_STATUS_PRODUCTS.active.toLowerCase()}`,
                value: E_STATUS_PRODUCTS.active,
              },
            ]}
            error={errors?.status?.message}
            selected={newStatus}
            onChange={handleStatus}
          />
        </VerticalStack>
      </Modal.Section>
    </CustomModal>
  );
};
