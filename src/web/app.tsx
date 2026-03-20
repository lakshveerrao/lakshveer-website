import { Route, Switch } from "wouter";
import Index from "./pages/index";
import Systems from "./pages/systems";
import Impact from "./pages/impact";
import Venture from "./pages/venture";
import Collaborate from "./pages/collaborate";
import Insider from "./pages/insider";
import Recognition from "./pages/recognition";
import RecognitionDetail from "./pages/recognition-detail";
import Journey from "./pages/journey";
import Share from "./pages/share";
import Invite from "./pages/invite";
import Press from "./pages/press";
import Endorse from "./pages/endorse";
import EndorsePublic from "./pages/endorse-public";
import Universe from "./pages/universe";
import { Provider } from "./components/provider";

function App() {
        return (
                <Provider>
                        <Switch>
                                <Route path="/" component={Index} />
                                <Route path="/systems" component={Systems} />
                                <Route path="/impact" component={Impact} />
                                <Route path="/venture" component={Venture} />
                                <Route path="/collaborate" component={Collaborate} />
                                <Route path="/journey" component={Journey} />
                                <Route path="/insider" component={Insider} />
                                <Route path="/recognition" component={Recognition} />
                                <Route path="/recognition/:slug" component={RecognitionDetail} />
                                <Route path="/share" component={Share} />
                                <Route path="/invite" component={Invite} />
                                <Route path="/press" component={Press} />
                                <Route path="/endorse" component={EndorsePublic} />
                                <Route path="/endorse/:token" component={Endorse} />
                                <Route path="/universe" component={Universe} />
                        </Switch>
                </Provider>
        );
}

export default App;
