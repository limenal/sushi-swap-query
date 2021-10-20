import {getPairsDaysInfo, getPairsHoursInfo, getPairsMinuteInfo} from './pairs.js'

async function main()
{
    // const pair = await getSwaps(1621390383, 60, 222)
    let pair = await getPairsHoursInfo(1633392000, 1634428800 , 'OHM', 'DAI')
    // console.log(pair[0])
    // for(let i = 0; i < pair.length; ++i)
    // {
        
    //     console.log(pair[i])

        
    // }
    // console.log(pair[pair.length - 1])
    console.log(pair.length)
}

main()