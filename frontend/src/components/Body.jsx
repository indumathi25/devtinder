import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import axiosInstance from "../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";

const Body = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const userData = useSelector((store) => store.user);

    const fetchUser = async () => {
        if (userData) return;
        try {
            const res = await axiosInstance.get("/profile");
            dispatch(addUser(res.data));
        } catch (err) {
            if (err.response?.status === 401) {
                // If we are on login or signup page, don't redirect to login again
                const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
                if (!isAuthPage) {
                    navigate("/login");
                }
            }
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div>
            <NavBar />
            <Outlet />
        </div>
    );
};

export default Body;
