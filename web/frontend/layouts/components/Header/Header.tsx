import React from "react";
import { Box, HorizontalStack, Icon, Text } from "@shopify/polaris";
import "./style.module.css";
import { FirstOrderMajor } from "@shopify/polaris-icons";

export const Header = () => {
  return (
    <Box
      minHeight={"64px"}
      as={"div"}
      aria-details={"container"}
      position={"sticky"}
    >
      <HorizontalStack align={"space-between"} blockAlign={"center"}>
        <HorizontalStack blockAlign={"center"} gap={"4"}>
          <Icon source={FirstOrderMajor} color={"success"} />
          <Text as={"h2"} fontWeight={"bold"} variant={"headingLg"}>
            Orders App
          </Text>
        </HorizontalStack>
      </HorizontalStack>
    </Box>
  );
};
