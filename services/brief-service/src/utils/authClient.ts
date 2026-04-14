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
  const url = `${gatewayUrl}/api/users/internal`;
  console.log(`[authClient] Fetching users from ${url} ids=${uniqueIds.join(",")}`);

  try {
    const response = await axios.get<UserSnapshot[]>(url, {
      params: { ids: uniqueIds.join(",") },
    });

    console.log(`[authClient] Got ${response.data.length} user(s)`);
    return new Map(response.data.map((user) => [user.id, user]));
  } catch (error: any) {
    console.error(
      `[authClient] Failed to fetch users — status=${error?.response?.status} body=${JSON.stringify(error?.response?.data)} url=${url}`
    );
    return new Map();
  }
}
