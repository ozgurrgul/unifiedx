import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CandlestickChart } from "./chart/candlestick/CandlestickChart";
import { DepthChart } from "./chart/depthChart/DepthChart";
import { ExchangeWidget } from "./ExchangeWidget";

export const ChartWidget = () => {
  return (
    <ExchangeWidget type="chart">
      <Tabs defaultValue="tv" className="w-full h-full flex flex-col">
        <TabsList className="w-full justify-start shrink-0">
          <TabsTrigger value="tv">Chart</TabsTrigger>
          <TabsTrigger value="depth">Depth</TabsTrigger>
        </TabsList>
        <TabsContent value="tv" className="flex-1 mt-0 min-h-0">
          <CandlestickChart />
        </TabsContent>
        <TabsContent value="depth" className="flex-1 mt-0 min-h-0">
          <DepthChart />
        </TabsContent>
      </Tabs>
    </ExchangeWidget>
  );
};
