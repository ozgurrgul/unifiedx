import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DepthChart } from "./chart/depthChart/DepthChart";
import { ExchangeWidget } from "./ExchangeWidget";

export const ChartWidget = () => {
  return (
    <ExchangeWidget type="chart">
      <Tabs defaultValue="depth" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="tv">Trading View</TabsTrigger>
          <TabsTrigger value="depth">Depth</TabsTrigger>
        </TabsList>
        <TabsContent value="tv">TV chart here</TabsContent>
        <TabsContent value="depth">
          <DepthChart />
        </TabsContent>
      </Tabs>
    </ExchangeWidget>
  );
};
