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
    const data = await fetch("http://66.42.61.9:8002/coin-predict/eth", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "symbol": "ETH",
            "number_next_date":3 
        }),
    }).then(
        data => data.json()
    );

    const responses = data

    // console.log("Oke")
    // console.log(responses)
    console.log(JSON.stringify(responses))

};

main(...process.argv.slice(2))