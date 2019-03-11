import { BitmexAPI } from "bitmex-node";
import * as fs from 'fs';

const bitmex = new BitmexAPI({
    "apiKeyID":     "P74RvpA68CYvwY-wj-XY524-",
    "apiKeySecret": "SFkgUhXWQRtXEGL0aQZ7R1VSfEWy7tsuE3B1E8IMyX8oy_Ow",
});

!async function () {

    try {
        // const chatMessage = await bitmex.Chat.new({ message: 'Pump incoming !!! ' });
        // console.log('chatMessage', chatMessage);
        const orders = await bitmex.OrderBook.getL2({ symbol: 'XBT', depth: 0 });
        console.log('orders', orders);
        const ordersStr = JSON.stringify(orders, null, 2);
        fs.writeFileSync('data.json', ordersStr);
    } catch (e) {
        console.log('error', e);
    }
}();
