import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editProfile } from "../../store/auth-slice/authSlice";
import { deleteProfile } from "../../store/auth-slice/authSlice";

const EditProfile = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    userName: "",
    profilePicture: null,
  });

  const dispatch = useDispatch();
  const { user, editProfileLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = "Profile | Shopping App";
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        userName: user.userName,
        profilePicture: user.profilePicture?.url,
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setProfile({
      ...profile,
      profilePicture: e.target.files[0],
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const newFile = event.dataTransfer.files[0];
    if (newFile) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        profilePicture: newFile,
      }));
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", profile.fullName);
    formData.append("phoneNumber", profile.phoneNumber);
    formData.append("email", profile.email);
    formData.append("userName", profile.userName);
    if (profile.profilePicture) {
      formData.append("profilePicture", profile.profilePicture);
    }

    dispatch(editProfile({ userId: user._id, formData }));
  };

  const handleDeleteProfile = () => {
    dispatch(deleteProfile({ userId: user._id }));
  };

  return (
    <div className="w-full p-6 bg-white shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary mb-6">My Account</h2>
        <button
          type="submit"
          className="py-2 px-5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          onClick={handleDeleteProfile}
        >
          Delete Account
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          {profile.profilePicture ? (
            <div
              className="relative w-32 h-32 group mx-auto"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <img
                src={
                  typeof profile.profilePicture === "string"
                    ? profile.profilePicture
                    : URL.createObjectURL(profile.profilePicture)
                }
                alt="profile-preview"
                width={200}
                height={200}
                className="rounded-full"
                style={{ objectFit: "cover", aspectRatio: "1/1" }}
              />

              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <span className="text-white">Change image</span>
              </div>

              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          ) : (
            <div
              className="relative w-32 h-32 group mx-auto border border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer rounded-full"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <p className="text-gray-500 text-sm p-2 mt-2 text-center rounded-full">
                Drag or click to add profile picture
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="mb-4">
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-lg focus:border-primary-dark focus:ring-primary-dark"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-lg focus:border-primary-dark focus:ring-primary-dark"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-lg focus:border-primary-dark focus:ring-primary-dark"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="userName"
              value={profile.userName}
              onChange={handleInputChange}
              className="mt-1 p-2 w-full border rounded-lg focus:border-primary-dark focus:ring-primary-dark"
            />
          </div>
        </div>
        <button
          type="submit"
          className="py-2 px-5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors duration-200"
          disabled={editProfileLoading}
        >
          {editProfileLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
