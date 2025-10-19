## UnifiedX

_What is UnifiedX?_

UnifiedX is a multi-exchange crypto trading platform where you can connect with your API key (currently very limited) and trade on various exchanges or see overall trades, prices and orderbook and along chart.

The project is currently in development.

## Development

```
git clone https://github.com/ozgurrgul/unifiedx.git
cd unifiedx
npm i
npm run dev
```

## How to add a new exchange?

Every exchange that needs to be added must do a few small things:

- Create the corresponding folder under `src/data`, such as `src/data/yourExchange`
- Create 2 files:
  - `src/data/yourExchange/types.ts`
  - `src/data/yourExchange/useYourExchange.ts`
  - `useYourExchange` will have the signature of input `UseExchangeDataInput` and output `UseExchangeDataOutput` (see other exchanges for the example)
  - One last thing, export a function which will return all markets with shape of `Promise<MarketsHashmap>` from your hook
- Add your exchange to `src/data/exchangeConfigs.ts`
- Voila! Now you can see your exchange on top left menu and start improving and supporting more functionalities.
