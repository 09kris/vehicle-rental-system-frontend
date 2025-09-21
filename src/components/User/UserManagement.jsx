import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const UserManagement = () => {
  const { axiosInstance } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [userType, setUserType] = useState("customer"); // default: customer

  // Fetch users from correct endpoint
  const fetchUsers = async () => {
    setLoading(true);
    try {
      let res;
      if (userType === "customer") {
        res = await axiosInstance.get("/customers"); // 👈 your backend endpoint
      } else if (userType === "agent") {
        res = await axiosInstance.get("/agents"); // 👈 your backend endpoint
      }
      setUsers(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userType]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Edit user
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role || userType, // fallback
    });
  };

  // Update user
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      let endpoint =
        userType === "customer"
          ? `/customers/${editingUser.id}`
          : `/agents/${editingUser.id}`;
      await axiosInstance.put(endpoint, formData);
      setSuccess("User updated successfully!");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user:", err);
      setError("Failed to update user.");
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      let endpoint =
        userType === "customer" ? `/customers/${id}` : `/agents/${id}`;
      await axiosInstance.delete(endpoint);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user.");
    }
  };

  // Search filter
  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.role || userType]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>

      {/* Dropdown to switch user type */}
      <div className="flex items-center space-x-4 mb-4">
        <label className="font-medium">Select User Type:</label>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="customer">Customer</option>
          <option value="agent">Agent</option>
        </select>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder={`Search ${userType}s by name, email, or role...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {loading && <p>Loading {userType}s...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="border p-2">{u.name}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2 capitalize">
                    {u.role || userType}
                  </td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No {userType}s found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Form */}
      {editingUser && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Edit {userType}</h3>
          <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            >
              <option value="">Select Role</option>
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
            </select>

            <div className="col-span-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
              >
                Update {userType}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
