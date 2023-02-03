import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import appRoutes from "./appRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
            {appRoutes.map(({ path, page}) => (
                <Route path={path} element={page} key={path}/>
            ))}
            <Route index element={<Navigate to='/overview' />} />
            <Route path="*" element={<Navigate to='/overview' />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
