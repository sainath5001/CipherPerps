"use client";

import React from "react";

export function TradingViewWidget() {
  // Lightweight embed via TradingView widget. (No API key needed.)
  return (
    <iframe
      title="TradingView ETH/USDT"
      className="h-full w-full"
      src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview&symbol=BINANCE%3AETHUSDT&interval=15&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=rgba(0%2C0%2C0%2C0)&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hidevolume=0&hideideas=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
      loading="lazy"
    />
  );
}

