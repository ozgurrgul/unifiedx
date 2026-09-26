import crypto from "crypto";
import { getCookies } from "cookies-next";
import type { NextApiRequest, NextApiResponse } from "next";

const FAPI_BASE = "https://fapi.binance.com/fapi/v1";

function sign(query: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(query).digest("hex");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const cookies = getCookies({ req, res });
  const apiKey = cookies.binance_api_key;
  const apiSecret = cookies.binance_api_secret;

  if (!apiKey || !apiSecret) {
    res.status(400).json({ error: "Binance API key and secret are required" });
    return;
  }

  const { type } = req.body as { type: string };

  try {
    if (type === "placeOrder") {
      const { symbol, side, orderType, quantity, price } = req.body as {
        symbol: string;
        side: "buy" | "sell";
        orderType: "market" | "limit";
        quantity?: string;
        price?: string;
      };

      if (!symbol || !side || !orderType || !quantity) {
        res.status(400).json({ error: "Missing order fields" });
        return;
      }

      const params = new URLSearchParams({
        symbol,
        side: side.toUpperCase(),
        type: orderType === "market" ? "MARKET" : "LIMIT",
        quantity,
        timestamp: String(Date.now()),
        recvWindow: "5000",
      });

      if (orderType === "limit") {
        if (!price) {
          res.status(400).json({ error: "Limit orders require a price" });
          return;
        }
        params.set("price", price);
        params.set("timeInForce", "GTC");
      }

      const signature = sign(params.toString(), apiSecret);
      params.append("signature", signature);

      const response = await fetch(`${FAPI_BASE}/order`, {
        method: "POST",
        headers: {
          "X-MBX-APIKEY": apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (!response.ok) {
        res.status(400).json({
          error: data.msg || data.message || "Binance futures order rejected",
        });
        return;
      }

      res.status(200).json(data);
      return;
    }

    res.status(400).json({ error: `Unknown request type: ${type}` });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
