import { AssetConfig } from "@/types/lib";

export const FormatAmount: React.FC<{
  amount?: string;
  precision: AssetConfig["precision"];
}> = ({ amount, precision }) => {
  if (typeof amount === "undefined" || amount === "undefined") {
    return null;
  }
  return (
    <>
      {Number(amount).toLocaleString(navigator.language || "en-US", {
        minimumFractionDigits: precision,
      })}
    </>
  );
};
