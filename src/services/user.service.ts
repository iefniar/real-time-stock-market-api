import { User } from "../models/user.model.ts";
import { Watchlist } from "../models/watchlist.model.ts";
import type { UserWithNewsEmailEnabled } from "../types/types.ts";

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

export async function getUsersWithNewsEmailEnabled(): Promise<UserWithNewsEmailEnabled[]> {
  try {
    // Get only enabled watchlist entries
    const watchlist = await Watchlist.find(
      {
        isNewsViaEmailActive: true
      },
      {
        userId: 1,
        symbol: 1,
        _id: 0
      }
    ).lean()

    if (!watchlist.length) {
      return []
    }

    // Group symbols by user
    const symbolsPerUser = new Map<string, string[]>()

    for (const item of watchlist) {
      const list = symbolsPerUser.get(item.userId) ?? []
      list.push(item.symbol)
      symbolsPerUser.set(item.userId, list)
    }

    const userIds = [...symbolsPerUser.keys()]

    const users = await User.find(
      {
        _id: { $in: userIds }
      },
      {
        _id: 1,
        email: 1,
        name: 1
      }
    ).lean()

    return users
      .filter(user => user.email && user.name)
      .map(user => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        symbols: symbolsPerUser.get(user._id.toString()) ?? []
      }))
  } catch (error) {
    console.error(error)
    return []
  }
}
