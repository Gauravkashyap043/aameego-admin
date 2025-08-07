export const formatTableData = (users: any[] = []) => {
  return users.map((user) => {
    // Map status values to display text and colors
    let statusText = "Pending";
    let statusColor = "yellow";

    if (user.status) {
      switch (user.status.toLowerCase()) {
        case "verified":
          statusText = "Verified";
          statusColor = "green";
          break;
        case "rejected":
          statusText = "Rejected";
          statusColor = "red";
          break;
        case "deactived":
          statusText = "Deactivated";
          statusColor = "orange";
          break;
        case "pending":
        default:
          statusText = "Pending";
          statusColor = "yellow";
          break;
      }
    } else if (user.isVerified) {
      // Fallback to isVerified field if status is not available
      statusText = "Verified";
      statusColor = "green";
    }

    return {
      id: user._id,
      name: user.name || "N/A",
      profileCode: user.profileCode,
      profileId: user._id,
      phone: user.authRef?.identifier || "N/A",
      status: statusText,
      statusColor: statusColor,
      lastLogin: user.authRef?.lastLoginAt ? user.authRef.lastLoginAt : null,
      profilePicture: user.profilePicture || "",
    };
  });
};
