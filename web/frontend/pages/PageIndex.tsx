import {
  VerticalStack,
  Image,
  Layout,
  LegacyCard,
  LegacyStack,
  Page,
  Text,
} from "@shopify/polaris";
import { useNavigate } from "react-router";
import trophyImgUrl from "../assets/home-trophy.png";

export default function PageIndex() {
  const navigate = useNavigate();

  return (
    <Page
      fullWidth
      backAction={{
        content: "Back",
        onAction: () => navigate(-1),
      }}
    >
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned>
            <LegacyStack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <LegacyStack.Item fill>
                <VerticalStack gap={"4"}>
                  <Text variant="headingMd" as="h1">
                    Page Index Example
                  </Text>
                </VerticalStack>
              </LegacyStack.Item>
              <LegacyStack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image
                    source={trophyImgUrl}
                    alt="Nice work on building a Shopify app"
                    width={120}
                  />
                </div>
              </LegacyStack.Item>
            </LegacyStack>
          </LegacyCard>
        </Layout.Section>
        <Layout.Section secondary>
          <LegacyCard sectioned>
            <LegacyStack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <LegacyStack.Item fill>
                <VerticalStack gap={"4"}>
                  <Text variant="headingMd" as="h1">
                    Secondary Section
                  </Text>
                </VerticalStack>
              </LegacyStack.Item>
            </LegacyStack>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}