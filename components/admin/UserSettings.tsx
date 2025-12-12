import React from "react";
import DeleteAllUsers from "./DeleteAllUsers";

const UserSettings: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>User Settings</h1>
      <DeleteAllUsers />
    </div>
  );
};

export default UserSettings;
