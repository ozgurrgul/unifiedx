import { CandlestickChart } from "./chart/candlestick/CandlestickChart";
import { DepthChart } from "./chart/depthChart/DepthChart";
import { ExchangeWidget } from "./ExchangeWidget";

export const CandlestickChartPanel = () => {
  return (
    <ExchangeWidget type="chart">
      <CandlestickChart />
    </ExchangeWidget>
  );
};

export const DepthChartPanel = () => {
  return (
    <ExchangeWidget type="depth-chart">
      <DepthChart />
    </ExchangeWidget>
  );
};
