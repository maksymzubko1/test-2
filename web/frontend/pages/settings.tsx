import { Text, Page, LegacyStack, VerticalStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ActiveSubscriptions } from "../components/ActiveSubscriptions";
import { Header } from "../layouts/components/Header/Header";

const Settings = () => {
  return (
    <VerticalStack gap={"10"}>
      <Header />
      <LegacyStack wrap={false} distribution="fill" alignment="center" vertical>
        <LegacyStack.Item>
          <LegacyStack vertical spacing="extraTight" alignment="center">
            <Text variant="heading2xl" as="h1">
              Settings page
            </Text>
          </LegacyStack>
        </LegacyStack.Item>
        <LegacyStack.Item>
          <ActiveSubscriptions />
        </LegacyStack.Item>
      </LegacyStack>
    </VerticalStack>
  );
};

export default Settings;
