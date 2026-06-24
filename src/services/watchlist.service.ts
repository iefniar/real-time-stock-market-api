import { User } from "../models/user.model.ts";
import { Watchlist } from "../models/watchlist.model.ts";

export async function getWatchlistSymbolsByEmail(
  email: string
): Promise<string[]> {
  if (!email) return [];

  try {
    const user = await User.findOne(
      { email },
      { _id: 1 }
    ).lean();

    if (!user) return [];

    const items = await Watchlist.find(
      { userId: user._id.toString() },
      { symbol: 1, _id: 0 }
    ).lean();

    return items.map(item => item.symbol);

  } catch (error) {
    console.error(
      "getWatchlistSymbolsByEmail error:",
      error
    );

    return [];
  }
}