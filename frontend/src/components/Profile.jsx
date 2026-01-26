import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../utils/axios";
import { addUser } from "../utils/userSlice";

const Profile = () => {
    const user = useSelector((store) => store.user);
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
    const [age, setAge] = useState(user?.age || "");
    const [gender, setGender] = useState(user?.gender || "");
    const [about, setAbout] = useState(user?.about || "");
    const [toast, setToast] = useState("");
    const dispatch = useDispatch();

    const handleSave = async () => {
        try {
            const res = await axiosInstance.patch("/profile/edit", {
                firstName, lastName, photoUrl, age, gender, about
            });
            dispatch(addUser(res.data.user));
            setToast("Profile updated successfully");
            setTimeout(() => setToast(""), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            setToast("Error updating profile: " + errorMsg);
        }
    }

    return (
        <div className="flex justify-center my-10 gap-10">
            <div className="card w-96 bg-base-300 shadow-xl p-5 h-fit">
                <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>

                <label className="form-control w-full max-w-xs mb-2">
                    <div className="label">
                        <span className="label-text">First Name</span>
                    </div>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input input-bordered w-full max-w-xs" />
                </label>
                <label className="form-control w-full max-w-xs mb-2">
                    <div className="label">
                        <span className="label-text">Last Name</span>
                    </div>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input input-bordered w-full max-w-xs" />
                </label>
                <label className="form-control w-full max-w-xs mb-2">
                    <div className="label">
                        <span className="label-text">Photo URL</span>
                    </div>
                    <input type="text" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} className="input input-bordered w-full max-w-xs" />
                </label>
                <label className="form-control w-full max-w-xs mb-2">
                    <div className="label">
                        <span className="label-text">Age</span>
                    </div>
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="input input-bordered w-full max-w-xs" />
                </label>
                <label className="form-control w-full max-w-xs mb-2">
                    <div className="label">
                        <span className="label-text">Gender</span>
                    </div>
                    {/* Could be select, using text for simplicity based on backend enum */}
                    <select className="select select-bordered" value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </label>
                <label className="form-control w-full max-w-xs mb-4">
                    <div className="label">
                        <span className="label-text">About</span>
                    </div>
                    <textarea className="textarea textarea-bordered h-24" value={about} onChange={(e) => setAbout(e.target.value)}></textarea>
                </label>

                <div className="card-actions justify-center">
                    <button className="btn btn-primary" onClick={handleSave}>Save Profile</button>
                </div>
                {toast && <div className="toast toast-top toast-center">
                    <div className="alert alert-success">
                        <span>{toast}</span>
                    </div>
                </div>}
            </div>

            <div className="card w-96 bg-base-100 shadow-xl h-fit">
                <h2 className="text-2xl font-bold mb-4 text-center mt-4">Preview</h2>
                <figure>
                    <img src={photoUrl || "https://geographyandyou.com/images/user-profile.png"} alt="User" className="w-full h-64 object-cover" />
                </figure>
                <div className="card-body">
                    <h2 className="card-title">{firstName} {lastName}</h2>
                    {(age || gender) && <p>{age && `${age}, `} {gender}</p>}
                    <p>{about}</p>
                </div>
            </div>
        </div>
    )
}
export default Profile;
