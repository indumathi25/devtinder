import useSWR from "swr";
import axiosInstance from "../utils/axios";

const Requests = () => {
    const { data: requests, error, isLoading, mutate } = useSWR("/user/requests/received");

    const reviewRequest = async (status, requestId) => {
        try {
            await axiosInstance.post(`/request/review/${status}/${requestId}`);
            mutate();
        } catch (err) {
            console.error(err);
        }
    }

    if (error) return <div className="text-center mt-10">Failed to load requests</div>;
    if (isLoading) return <div className="text-center mt-10">Loading...</div>;

    if (!requests || requests.length === 0) return <div className="text-center mt-10">No requests found</div>;

    return (
        <div className="flex flex-col items-center my-10">
            <h1 className="text-3xl font-bold mb-5">Connection Requests</h1>
            {requests.map((request) => {
                const { fromUserId, _id } = request;
                return (
                    <div key={_id} className="card card-side bg-base-200 shadow-xl w-1/2 mb-4">
                        <figure><img src={fromUserId.photoUrl} alt="User" className="w-24 h-24 object-cover m-4 rounded-full" /></figure>
                        <div className="card-body">
                            <h2 className="card-title">{fromUserId.firstName} {fromUserId.lastName}</h2>
                            <p>{fromUserId.about}</p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-error btn-sm" onClick={() => reviewRequest("rejected", _id)}>Reject</button>
                                <button className="btn btn-success btn-sm" onClick={() => reviewRequest("accepted", _id)}>Accept</button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
export default Requests;
