import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type Address = {
  id: string;
  receiver: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
};

const USERS_KEY = "bvp_shop_users_v1";
const SESSION_KEY = "bvp_shop_session_v1";
const ADDRESSES_KEY = "bvp_shop_addresses_v1";

const DEMO_USER: UserProfile = {
  id: "demo-user",
  fullName: "Test User",
  email: "testuser@example.com",
  phone: "0987654321",
  password: "123456",
};

async function readUsers(): Promise<UserProfile[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  const users = raw ? (JSON.parse(raw) as UserProfile[]) : [];

  if (!users.length) {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([DEMO_USER]));
    return [DEMO_USER];
  }

  return users;
}

export async function registerUser(
  input: Omit<UserProfile, "id">,
): Promise<UserProfile> {
  const users = await readUsers();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  if (
    users.some(
      (u) => u.email.toLowerCase() === email || (phone && u.phone === phone),
    )
  ) {
    throw new Error("Email hoặc số điện thoại đã được đăng ký.");
  }
  const user: UserProfile = {
    ...input,
    id: `${Date.now()}`,
    fullName: input.fullName.trim(),
    email,
    phone,
  };
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function loginUser(
  identifier: string,
  password: string,
): Promise<UserProfile> {
  const users = await readUsers();
  const key = identifier.trim().toLowerCase();
  const user = users.find(
    (u) => u.email.toLowerCase() === key || u.phone === identifier.trim(),
  );
  if (!user || user.password !== password) {
    throw new Error(
      "Thông tin đăng nhập không đúng. Nếu chưa có tài khoản, hãy đăng ký trước.",
    );
  }
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export async function updateCurrentUser(
  changes: Pick<UserProfile, "fullName" | "email" | "phone">,
): Promise<UserProfile> {
  const current = await getCurrentUser();
  if (!current) throw new Error("Bạn chưa đăng nhập.");
  const users = await readUsers();
  const email = changes.email.trim().toLowerCase();
  const duplicate = users.some(
    (u) =>
      u.id !== current.id &&
      (u.email.toLowerCase() === email ||
        (changes.phone && u.phone === changes.phone.trim())),
  );
  if (duplicate)
    throw new Error("Email hoặc số điện thoại đã được tài khoản khác sử dụng.");
  const updated = {
    ...current,
    ...changes,
    email,
    fullName: changes.fullName.trim(),
    phone: changes.phone.trim(),
  };
  await AsyncStorage.setItem(
    USERS_KEY,
    JSON.stringify(users.map((u) => (u.id === current.id ? updated : u))),
  );
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getAddresses(): Promise<Address[]> {
  const raw = await AsyncStorage.getItem(ADDRESSES_KEY);
  return raw ? (JSON.parse(raw) as Address[]) : [];
}

export async function saveAddress(address: Address): Promise<Address[]> {
  let addresses = await getAddresses();
  if (address.isDefault)
    addresses = addresses.map((a) => ({ ...a, isDefault: false }));
  const index = addresses.findIndex((a) => a.id === address.id);
  if (index >= 0) addresses[index] = address;
  else addresses = [...addresses, address];
  if (addresses.length === 1)
    addresses = addresses.map((a) => ({ ...a, isDefault: true }));
  await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
  return addresses;
}

export async function deleteAddress(id: string): Promise<Address[]> {
  let addresses = (await getAddresses()).filter((a) => a.id !== id);
  if (addresses.length && !addresses.some((a) => a.isDefault))
    addresses[0] = { ...addresses[0], isDefault: true };
  await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
  return addresses;
}
