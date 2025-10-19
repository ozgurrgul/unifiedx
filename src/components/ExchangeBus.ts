import EventEmitter from "eventemitter3";

export const BusEvent = {
  CancelOrder: "cancelOrder",
  CreateOrder: "createOrder",
};

export const $bus = new EventEmitter();
