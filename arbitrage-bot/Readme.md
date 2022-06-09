
npm install --save

node kucoin-uniswap-trade.js

Nguyên tắc mua thấp bán cao

Case 1: Nếu tỉ lệ UOS/USDT trên Uni thấp hơn Kucoin

Uni: 1.11 & Kucoin: 1.15

1. Mua UOS từ USDT trên Uniswap
   Uni: 111 USDT --> 100 UOS
2. Bán UOS lấy USDT trên Kucoin
   100 UOS --> 115 USDT
-> Lời 4 USDT - (gasFee)

Case 2: Nếu tỉ lệ UOS/USDT trên Uni cao hơn Kucoin
Uni: 1.20 & Kucoin: 1.15
1. Mua UOS từ USDT trên Kucoin
   Kucoin: 115 USDT --> 100 UOS
2. Bán UOS lấy USDT on Uni
   Uni: 100 UOS --> 120 USDT
-> Lời 5 USDT - (gasFee)

### Cap UOS/USDT: amount la 4 so 0