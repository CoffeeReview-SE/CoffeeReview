import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  birthDate?: string; // Optional personal detail
  gender?: "female" | "male" | "other"; // Optional personal detail
  avatarUri?: string; // Optional avatar URI
};

export type Address = {
  id: string;
  ownerId?: string; // Optional account ownership
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
const PROMO_EMAILS_KEY = "bvp_shop_promo_emails_v1";

const DEMO_USER: UserProfile = {
  id: "demo-user",
  fullName: "Test User",
  email: "testuser@example.com",
  phone: "0987654321",
  password: "123456",
};

async function readUsers(): Promise<UserProfile[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (raw === null) {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([DEMO_USER]));
    return [DEMO_USER];
  }
  return JSON.parse(raw) as UserProfile[];
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
  changes: Pick<UserProfile, "fullName" | "email" | "phone"> &
    Partial<Pick<UserProfile, "birthDate" | "gender" | "avatarUri">>,
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
    birthDate: changes.birthDate?.trim() ?? current.birthDate,
  };
  await AsyncStorage.setItem(
    USERS_KEY,
    JSON.stringify(users.map((u) => (u.id === current.id ? updated : u))),
  );
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

export async function deleteCurrentAccount(
  currentPassword: string,
  confirmation: string,
): Promise<void> {
  const current = await getCurrentUser();
  if (!current) throw new Error("Bạn chưa đăng nhập.");
  if (current.password !== currentPassword) {
    throw new Error("Mật khẩu hiện tại không đúng.");
  }
  if (confirmation !== "XOA TAI KHOAN") {
    throw new Error('Vui lòng nhập chính xác "XOA TAI KHOAN" để xác nhận.');
  }

  const users = await readUsers();
  const remainingUsers = users.filter((user) => user.id !== current.id);
  const rawAddresses = await AsyncStorage.getItem(ADDRESSES_KEY);
  const addresses = rawAddresses ? (JSON.parse(rawAddresses) as Address[]) : [];
  const otherUsersAddresses = addresses.filter(
    (address) => address.ownerId && address.ownerId !== current.id,
  );
  const rawPreferences = await AsyncStorage.getItem(PROMO_EMAILS_KEY);
  const preferences = rawPreferences
    ? (JSON.parse(rawPreferences) as Record<string, boolean>)
    : {};
  delete preferences[current.id];

  await AsyncStorage.multiSet([
    [USERS_KEY, JSON.stringify(remainingUsers)],
    [ADDRESSES_KEY, JSON.stringify(otherUsersAddresses)],
    [PROMO_EMAILS_KEY, JSON.stringify(preferences)],
  ]);
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function changeCurrentPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const current = await getCurrentUser();
  if (!current) throw new Error("Bạn chưa đăng nhập.");
  if (current.password !== currentPassword) {
    throw new Error("Mật khẩu hiện tại không đúng.");
  }
  if (newPassword.length < 6) {
    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
  }

  const users = await readUsers();
  const updated = { ...current, password: newPassword };
  await AsyncStorage.setItem(
    USERS_KEY,
    JSON.stringify(
      users.map((user) => (user.id === current.id ? updated : user)),
    ),
  );
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
}

export async function getPromoEmailPreference(
  userId: string,
): Promise<boolean> {
  const raw = await AsyncStorage.getItem(PROMO_EMAILS_KEY);
  const preferences = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  return preferences[userId] ?? false;
}

export async function setPromoEmailPreference(
  userId: string,
  enabled: boolean,
): Promise<void> {
  const raw = await AsyncStorage.getItem(PROMO_EMAILS_KEY);
  const preferences = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  await AsyncStorage.setItem(
    PROMO_EMAILS_KEY,
    JSON.stringify({ ...preferences, [userId]: enabled }),
  );
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getAddresses(userId?: string): Promise<Address[]> {
  const raw = await AsyncStorage.getItem(ADDRESSES_KEY);
  const addresses = raw ? (JSON.parse(raw) as Address[]) : [];
  if (!userId) return addresses;

  const migrated = addresses.map((address) =>
    address.ownerId ? address : { ...address, ownerId: userId },
  );
  if (migrated.some((address, index) => address !== addresses[index])) {
    await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(migrated));
  }
  return migrated.filter((address) => address.ownerId === userId);
}

export async function saveAddress(
  address: Address,
  userId?: string,
): Promise<Address[]> {
  const ownerId = address.ownerId ?? userId;
  if (ownerId) await getAddresses(ownerId);
  const rawAddresses = await AsyncStorage.getItem(ADDRESSES_KEY);
  let addresses = rawAddresses ? (JSON.parse(rawAddresses) as Address[]) : [];
  const storedAddress = ownerId ? { ...address, ownerId } : address;
  if (storedAddress.isDefault)
    addresses = addresses.map((savedAddress) =>
      savedAddress.ownerId === ownerId
        ? { ...savedAddress, isDefault: false }
        : savedAddress,
    );
  const index = addresses.findIndex(
    (savedAddress) =>
      savedAddress.id === storedAddress.id &&
      savedAddress.ownerId === storedAddress.ownerId,
  );
  if (index >= 0) addresses[index] = storedAddress;
  else addresses = [...addresses, storedAddress];
  const ownedAddresses = addresses.filter(
    (savedAddress) => savedAddress.ownerId === ownerId,
  );
  if (ownedAddresses.length === 1 && !ownedAddresses[0].isDefault) {
    addresses = addresses.map((savedAddress) =>
      savedAddress.id === ownedAddresses[0].id &&
      savedAddress.ownerId === ownerId
        ? { ...savedAddress, isDefault: true }
        : savedAddress,
    );
  }
  await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
  return ownerId
    ? addresses.filter((savedAddress) => savedAddress.ownerId === ownerId)
    : addresses;
}

export async function deleteAddress(
  id: string,
  userId?: string,
): Promise<Address[]> {
  const allAddresses = await getAddresses();
  let addresses = allAddresses.filter(
    (address) => address.id !== id || (userId && address.ownerId !== userId),
  );
  const ownedAddresses = userId
    ? addresses.filter((address) => address.ownerId === userId)
    : addresses;
  if (
    ownedAddresses.length &&
    !ownedAddresses.some((address) => address.isDefault)
  ) {
    const firstAddress = ownedAddresses[0];
    addresses = addresses.map((address) =>
      address.id === firstAddress.id && address.ownerId === firstAddress.ownerId
        ? { ...address, isDefault: true }
        : address,
    );
  }
  await AsyncStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
  return userId
    ? addresses.filter((address) => address.ownerId === userId)
    : addresses;
}
