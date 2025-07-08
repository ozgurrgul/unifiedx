import EventEmitter from "eventemitter3";

export const BusEvent = {
  CancelOrder: "cancelOrder",
  CreateOrder: "createOrder",
  RefreshDataLayer: "refreshDataLayer",
};

export const $bus = new EventEmitter();
