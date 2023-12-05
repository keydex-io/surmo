export enum BusinessType {
  PlaceBuyOrder = 1,
  PlaceSellOrder = 2,
  CancelBuyOrder = 3,
  cancelSellOrder = 4,
  BoughtAdd = 5,
  SoldAdd = 6,
  Deposit = 7,
  Withdraw = 8,
  Airdrop = 9,
  PlayGameConsume = 10,
}

export const BusinessType_TO_Name_MAP: Record<BusinessType, string> = {
  [BusinessType.PlaceBuyOrder]: "place buy_order",
  [BusinessType.PlaceSellOrder]: "place sell_order",
  [BusinessType.CancelBuyOrder]: "cancel buy_order",
  [BusinessType.cancelSellOrder]: "cancel sell_order",
  [BusinessType.BoughtAdd]: "add bought token",
  [BusinessType.SoldAdd]: "after sold, add usdt",
  [BusinessType.Deposit]: "deposit",
  [BusinessType.Withdraw]: "withdraw",
  [BusinessType.Airdrop]: "airdrop",
  [BusinessType.PlayGameConsume]: "play game consumed"
}