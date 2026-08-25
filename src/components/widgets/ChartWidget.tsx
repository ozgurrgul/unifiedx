import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DepthChart } from "./chart/depthChart/DepthChart";
import { ExchangeWidget } from "./ExchangeWidget";

export const ChartWidget = () => {
  return (
    <ExchangeWidget type="chart">
      <Tabs defaultValue="depth" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="tv">Trading View</TabsTrigger>
          <TabsTrigger value="depth">Depth</TabsTrigger>
        </TabsList>
        <TabsContent value="tv" className="flex items-center justify-center h-48 text-muted-foreground text-xs">
          TradingView chart coming soon
        </TabsContent>
        <TabsContent value="depth">
          <DepthChart />
        </TabsContent>
      </Tabs>
    </ExchangeWidget>
  );
};
