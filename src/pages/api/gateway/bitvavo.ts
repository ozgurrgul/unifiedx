import type { NextApiRequest, NextApiResponse } from "next";
import { promisify } from "util";
import { getCookies } from "cookies-next";

type ResponseData = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const type = req.body.type;

  try {
    const cookies = getCookies({ req, res });
    const apiKey = cookies["bitvavo_api_key"];
    const apiSecret = cookies["bitvavo_api_secret"];

    if (!apiKey || !apiSecret) {
      throw new Error("Api key or api secret is not provided");
    }

    const bitvavo = require("bitvavo")().options({
      APIKEY: apiKey,
      APISECRET: apiSecret,
    });

    const pOpenOrders = promisify(bitvavo.ordersOpen);
    const pGetOrders = promisify(bitvavo.getOrders);
    const pCancelOrder = promisify(bitvavo.cancelOrder);
    const pPlaceOrder = promisify(bitvavo.placeOrder);
    const pBalance = promisify(bitvavo.balance);

    let response = [];
    if (type === "openOrders") {
      response = await pOpenOrders({});
    } else if (type === "postCancelOrder") {
      response = await pCancelOrder(req.body.extra.market, req.body.extra.id);
    } else if (type === "postPlaceOrder") {
      response = await pPlaceOrder(
        req.body.extra.market,
        req.body.extra.side,
        req.body.extra.orderType,
        req.body.extra.body
      );
    } else if (type === "balance") {
      response = await pBalance({});
    } else if (type === "getOrders") {
      response = await pGetOrders(req.body.extra.market);
    }
    res.status(200).json(response);
  } catch (e) {
    const err = e as any;
    res.status(400).json({
      error: "error" in err ? String(err.error) : String(err),
    });
  }
}
