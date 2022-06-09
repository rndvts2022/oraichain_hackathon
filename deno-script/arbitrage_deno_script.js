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
    const data = await fetch("http://66.42.61.9:3000/tokenTradedPair/findByTimeAndLimit", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "exchanges_id": 1,
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