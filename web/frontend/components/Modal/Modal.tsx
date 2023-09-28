import React, { ReactNode } from "react";
import { Box, ComplexAction, Frame, Modal, Text } from "@shopify/polaris";

interface I_Props {
  title: string;
  opened: boolean;
  children: string | ReactNode;
  onClose: () => void;
  primaryAction?: ComplexAction;
  secondaryActions?: ComplexAction[];
}

export const CustomModal = ({
  title,
  children,
  onClose,
  secondaryActions,
  primaryAction,
  opened,
}: I_Props) => {
  return (
    <Box position={"absolute"}>
      <Frame>
        <Modal
          open={opened}
          title={title}
          onClose={onClose}
          secondaryActions={secondaryActions}
          primaryAction={primaryAction}
        >
          {typeof children === "string" ? (
            <Modal.Section>
              <Text as={"p"}>{children}</Text>
            </Modal.Section>
          ) : (
            children
          )}
        </Modal>
      </Frame>
    </Box>
  );
};
