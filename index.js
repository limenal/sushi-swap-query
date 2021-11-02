import {getPairsDaysInfo, getPairsHoursInfo, getPairsMinuteInfo, getPairsNHoursInfo, getPairsNDaysInfo, getPairsNMinutesInfo} from './pairs.js'

async function main()
{
    // const pair = await getSwaps(1621390383, 60, 222)
    let pair = await getPairsNMinutesInfo(1635724800, 1635897600 , 'OHM', 'DAI', 1)
    for(let i = 0; i < pair.length; ++i)
    {
        if(pair[i].token1PriceOpen == undefined)
        {
            console.log(pair[i])

        }
    }
    // console.log(pair[pair.length - 1])
    console.log(pair.length)
}

main()