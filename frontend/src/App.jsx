import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SWRConfig } from "swr";
import appStore from "./utils/appStore";
import fetcher from "./utils/fetcher";
import Body from "./components/Body";
import Login from "./components/Login";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import Connections from "./components/Connections";
import Requests from "./components/Requests";

function App() {
  return (
    <Provider store={appStore}>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: false, // Prevents multiple API calls when switching tabs during dev
          shouldRetryOnError: false // Optional: don't retry if backend fails
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Body />}>
              <Route path="/" element={<Feed />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/requests" element={<Requests />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SWRConfig>
    </Provider>
  );
}

export default App;
