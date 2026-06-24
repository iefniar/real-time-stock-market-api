import {
  getDateRange,
  validateArticle,
  formatArticle
} from "../lib/utils.ts";

const FINNHUB_BASE_URL =
  "https://finnhub.io/api/v1";

const FINNHUB_API_KEY =
  process.env.FINNHUB_API_KEY ?? "";

async function fetchJSON<T>(
  url: string
): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response
      .text()
      .catch(() => "");

    throw new Error(
      `Fetch failed ${response.status}: ${text}`
    );
  }

  return await response.json();
}

export async function getNews(
  symbols?: string[]
) {
  try {
    const token = FINNHUB_API_KEY;

    if (!token) {
      throw new Error(
        "FINNHUB_API_KEY missing"
      );
    }

    const maxArticles = 6;

    const cleanSymbols =
      (symbols || [])
        .map(s =>
          s?.trim().toUpperCase()
        )
        .filter(Boolean);

    const range =
      getDateRange(5);

    // company news
    if (cleanSymbols.length) {
      const allNews =
        await Promise.all(
          cleanSymbols.map(
            async symbol => {
              try {
                const url =
                  `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${range.from}&to=${range.to}&token=${token}`;

                const data =
                  await fetchJSON<any[]>(
                    url
                  );

                return data
                  .filter(
                    validateArticle
                  )
                  .map(
                    (
                      article,
                      index
                    ) =>
                      formatArticle(
                        article,
                        true,
                        symbol,
                        index
                      )
                  );

              } catch (error) {
                console.error(
                  error
                );

                return [];
              }
            }
          )
        );

      const articles =
        allNews
          .flat()
          .sort(
            (a, b) =>
              b.datetime -
              a.datetime
          )
          .slice(
            0,
            maxArticles
          );

      if (
        articles.length
      ) {
        return articles;
      }
    }

    // fallback
    const generalURL =
      `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;

    const general =
      await fetchJSON<any[]>(
        generalURL
      );

    return general
      .filter(
        validateArticle
      )
      .slice(0, maxArticles)
      .map(
        (
          article,
          index
        ) =>
          formatArticle(
            article,
            false,
            undefined,
            index
          )
      );

  } catch (error) {
    console.error(
      "getNews:",
      error
    );

    return [];
  }
}

export async function searchStocks(
  query?: string
) {
  try {
    if (
      !FINNHUB_API_KEY
    ) {
      return [];
    }

    const trimmed =
      query?.trim() ||
      "";

    const url =
      `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${FINNHUB_API_KEY}`;

    const response =
      await fetchJSON<any>(
        url
      );

    return (
      response.result ||
      []
    )
      .map(
        (stock: any) => ({
          symbol:
            stock.symbol,
          name:
            stock.description,
          exchange:
            stock.displaySymbol,
          type:
            stock.type,
          isInWatchlist:
            false,
        })
      )
      .slice(0, 15);

  } catch (error) {
    console.error(
      "searchStocks:",
      error
    );

    return [];
  }
}
