import { User } from "../models/user.model.ts";

export async function getAllUsersForNewsEmail() {
  try {
    const users = await User.find(
      {
        email: {
          $exists: true,
          $ne: null,
        },
      },
      {
        _id: 1,
        email: 1,
        name: 1,
        country: 1,
      }
    ).lean();

    return users
      .filter(
        (user) =>
          user.email &&
          user.name
      )
      .map((user) => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      }));
  } catch (error) {
    console.error(
      "Error fetching users for news email:",
      error
    );

    return [];
  }
}
