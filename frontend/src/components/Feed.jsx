import { api } from "../utils/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Feed = () => {
    const queryClient = useQueryClient();
    const { data: feed, isLoading, isError, error } = useQuery({
        queryKey: ["feed"],
        queryFn: () => api.get("/feed"),
    });

    const mutation = useMutation({
        mutationFn: ({ status, userId }) => api.post(`/request/send/${status}/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
        },
    });

    if (isLoading) return <div className="text-center mt-10">Loading...</div>;
    if (isError) return <div className="text-center mt-10 text-red-500">Error: {error.message}</div>;
    if (!Array.isArray(feed) || feed.length === 0) return <div className="text-center mt-10">No users found</div>;

    const user = feed[0];

    const handleSendRequest = (status) => {
        mutation.mutate({ status, userId: user._id });
    }

    return (
        <div className="flex justify-center my-10">
            <div className="card w-96 bg-base-100 shadow-xl">
                <figure>
                    <img src={user.photoUrl} alt="User" className="w-full h-64 object-cover" />
                </figure>
                <div className="card-body">
                    <h2 className="card-title">{user.firstName} {user.lastName}</h2>
                    {user.age && <p>Age: {user.age}</p>}
                    {user.gender && <p>Gender: {user.gender}</p>}
                    <p>{user.about}</p>
                    <div className="card-actions justify-center mt-5">
                        <button className="btn btn-secondary" onClick={() => handleSendRequest("ignored")}>Ignore</button>
                        <button className="btn btn-primary" onClick={() => handleSendRequest("interested")}>Interested</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Feed;
