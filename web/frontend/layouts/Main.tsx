import { Outlet } from "react-router-dom";
import { Header } from "./components/Header/Header";
import { Box, Divider, Grid, VerticalStack } from "@shopify/polaris";
import { Sidebar } from "./components/Sidebar/Sidebar";
import "./style.css";

export const MainLayout = () => {
  return (
    <VerticalStack>
      <Header />
      <Grid columns={{ xl: 12, lg: 12, md: 6, sm: 6 }}>
        <Grid.Cell columnSpan={{ xl: 2, lg: 2, md: 1, sm: 1 }}>
          <Sidebar />
        </Grid.Cell>
        <Grid.Cell columnSpan={{ xl: 10, lg: 10, md: 5, sm: 5 }}>
          <Box aria-details={"main-content"} overflowX={"hidden"}>
            <Outlet />
            <br />
            <br />
          </Box>
        </Grid.Cell>
      </Grid>
    </VerticalStack>
  );
};
