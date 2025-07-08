import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = any;

const fetchJson = async (url: string) => {
  return await fetch(url).then((r) => r.json());
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const type = req.body.type;

  try {
    let response = {};
    if (type === "/server/exchangeInfo") {
      response = await fetchJson(
        "https://api.btcturk.com/api/v2/server/exchangeInfo"
      );
    }
    if (type === "/server/time") {
      response = await fetchJson(
        "https://api.btcturk.com/api/v2/server/time"
      );
    } else if (type === "/ticker") {
      response = await fetchJson("https://api.btcturk.com/api/v2/ticker");
    } else if (type === "/trades") {
      response = await fetchJson(
        `https://api.btcturk.com/api/v2/trades?pairSymbol=${req.body.extra.market}`
      );
    } else if (type === "/orderbook") {
      response = await fetchJson(
        `https://api.btcturk.com/api/v2/orderbook?pairSymbol=${req.body.extra.market}`
      );
    }
    res.status(200).json(response);
  } catch (e) {
    const err = e as any;
    res.status(400).json({
      error: "error" in err ? String(err.error) : String(err),
    });
  }
}
