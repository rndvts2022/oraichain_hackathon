import _ from "https://deno.land/std@0.120.0/node/module.ts";

const httpGet = async (url) => {
    const data = await fetch(url).then(data => data.json());
    return data;
}

const httpPost = async (url) => {
    const data = await fetch(url).then(data => data.json());
    return data;
}

const main = async (symbols) => {
    // const responses = [];
    // const listSymbols = JSON.parse(JSON.parse(symbols)[0]);
    // const urls = listSymbols.map(symbol => `https://api.kucoin.com/api/v1/prices?currencies=${symbol}`);
    // for (let i = 0; i < urls.length; i++) {
    //     const result = await httpGet(urls[i]);
    //     if (listSymbols[i] in result.data) {
    //         responses.push({
    //             name: listSymbols[i],
    //             prices: [result.data[listSymbols[i]]]
    //         });
    //     }
    // }
    const data = await fetch("http://66.42.61.9:3000/tokenTradedPair/findByTimeAndLimit", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // "time": "2022-06-30T13:05:34",
            // "limit": 50,
            "exchanges_id": 1,
            // "typeTrade": "1"
        }),
    }).then(
        data => data.json()
    );

    const responses = []

    for(let i =0;i<data.result.length;i++){
        responses.push(data.result[i])
    }

    console.log("Oke")
    console.log(responses)
};

main(...process.argv.slice(2))