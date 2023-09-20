import {Navigate, Outlet, useLocation} from "react-router-dom";
import {Header} from "./components/Header/Header";
import {Grid, Page} from "@shopify/polaris";
import {Sidebar} from "./components/Sidebar/Sidebar";

export const MainLayout = () => {
    return (
        <div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>
            <Grid columns={{xl: 12}}>
                <Grid.Cell columnSpan={{xl:12}}>
                    <Header/>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xl:2}}>
                    <Sidebar/>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xl:9}}>
                    <Outlet/>
                </Grid.Cell>
            </Grid>
        </div>
    );
};
