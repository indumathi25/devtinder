import axiosInstance from "../utils/axios";
import useSWR from "swr";

const Feed = () => {
    const { data: feed, mutate } = useSWR("/feed");

    if (!feed) return <div className="text-center mt-10">Loading...</div>;
    if (feed.length === 0) return <div className="text-center mt-10">No users found</div>;

    const user = feed[0];

    const handleSendRequest = async (status) => {
        try {
            await axiosInstance.post(`/request/send/${status}/${user._id}`);
            mutate();
        } catch (err) {
            console.error(err);
        }
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
