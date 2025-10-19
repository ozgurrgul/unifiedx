import React from "react";
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
      className={`widget widget-${type}`}
      style={{ gridArea: type }}
      ref={widgetRef}
    >
      <div className="widget-card-header" ref={headerRef}>
        {header}
      </div>
      <Card
        className="w-full rounded-none border-none w-full bg-background"
        style={{ height: availableBodyHeight }}
      >
        <div style={{ height: availableBodyHeight, overflowY: "auto" }}>
          <CardContent className="widget-content p-0">{children}</CardContent>
        </div>
      </Card>
    </div>
  );
};
