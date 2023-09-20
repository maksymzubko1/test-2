import { Text, Page, LegacyStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ActiveSubscriptions } from "../components/ActiveSubscriptions";

const Settings = () => {
  return (
    <Page>
      <TitleBar title="Settings" primaryAction={null} />
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
    </Page>
  );
};

export default Settings;
