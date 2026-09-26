import type React from "react";
import { Card, CardContent } from "../ui/card";
import { useBaseWidget } from "./useBaseWidget";

type ExchangeWidgetProps = {
  children: any;
  header?: any;
  type: string;
};

// eslint-disable-next-line react/display-name
export const ExchangeWidget: React.FC<ExchangeWidgetProps> = ({
  children,
  type,
  header,
}) => {
  const { widgetRef, height, headerRef, headerHeight } = useBaseWidget();
  const availableBodyHeight = height - headerHeight;

  return (
    <div
      className={`widget widget-${type} h-full min-h-0 flex flex-col`}
      ref={widgetRef}
    >
      <div className="widget-card-header" ref={headerRef}>
        {header}
      </div>
      <Card
        className="w-full rounded-none border-none w-full bg-background"
        style={{ height: availableBodyHeight }}
      >
        <div
          className="h-full min-h-0"
          style={{ height: availableBodyHeight, overflowY: "auto" }}
        >
          <CardContent className="widget-content p-0 h-full min-h-0">
            {children}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};
