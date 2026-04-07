import axios from "axios";

export interface UserSnapshot {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}


export async function fetchUsersFromAuthService(userIds: string[]): Promise<Map<string, UserSnapshot>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (!uniqueIds.length) {
    return new Map();
  }

  const gatewayUrl = process.env.GATEWAY_URL || "http://localhost:8080";

  try {
    const response = await axios.get<UserSnapshot[]>(
      `${gatewayUrl}/api/users/internal`,
      {
        params: { ids: uniqueIds.join(",") },
      }
    );

    return new Map(response.data.map((user) => [user.id, user]));
  } catch (error) {
    console.error("Error communicating with Auth Service via Gateway:", error);
    return new Map();
  }
}
