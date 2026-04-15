
import {
  Switch,
  Route,
} from "react-router-dom";
import Centered from "../components/Centered";
import Header from "../components/Header";
import useLaunches from "../hooks/useLaunches";
import usePlanets from "../hooks/usePlanets";

import Launch from "./Launch";
import History from "./History";
import Upcoming from "./Upcoming";
import LaunchDetails from "./LaunchDetails";
import Articles from "./Articles";
import ExoplanetMap from "./ExoplanetMap";

const AppLayout = props => {


  const {
    launches,
    isPendingLaunch,
    submitLaunch,
    abortLaunch,
  } = useLaunches();

  const planets = usePlanets();
  
  return <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
    <div className="scanlines"></div>
    <Header />
    <Centered style={{ flex: 1, padding: "20px" }}>
      <div className={`sci-fi-panel fade-in`} style={{ minHeight: "60vh" }}>
        <Switch>
          <Route exact path="/">
            <Launch 
              planets={planets}
              submitLaunch={submitLaunch}
              isPendingLaunch={isPendingLaunch} />
          </Route>
          <Route exact path="/launch">
            <Launch
              planets={planets}
              submitLaunch={submitLaunch}
              isPendingLaunch={isPendingLaunch} />
          </Route>
          <Route exact path="/upcoming">
            <Upcoming
              launches={launches}
              abortLaunch={abortLaunch} />
          </Route>
          <Route exact path="/history">
            <History launches={launches} />
          </Route>
          <Route path="/history/:id">
            <LaunchDetails />
          </Route>
          <Route exact path="/articles">
            <Articles />
          </Route>
          <Route exact path="/exoplanets">
            <ExoplanetMap />
          </Route>
        </Switch>
      </div>
    </Centered>
  </div>;
};

export default AppLayout;