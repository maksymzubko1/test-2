import {Outlet} from "react-router-dom";
import {Header} from "./components/Header/Header";
import {Box, Grid, VerticalStack} from "@shopify/polaris";
import {Sidebar} from "./components/Sidebar/Sidebar";
import {TitleBar} from "@shopify/app-bridge-react";
import "./style.css"

export const MainLayout = () => {
    return (
        <>
            <TitleBar title="App" primaryAction={null}/>
            <VerticalStack>
                <Header/>
                <Grid columns={{xl: 12}}>
                    <Grid.Cell columnSpan={{xl: 2}}>
                        <Sidebar/>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xl: 10}}>
                        <Box paddingBlockStart={"10"} paddingInlineEnd={"10"} aria-details={"main-content"} paddingBlockEnd={"10"}>
                            <Outlet/>
                        </Box>
                    </Grid.Cell>
                </Grid>
            </VerticalStack>
        </>
    );
};
