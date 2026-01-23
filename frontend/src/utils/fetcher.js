import axiosInstance from "./axios";

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export default fetcher;
