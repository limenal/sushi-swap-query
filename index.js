import {getPairsDaysInfo, getPairsHoursInfo, getPairsMinuteInfo} from './pairs.js'

async function main()
{
    const pair = await getPairsMinuteInfo(1634079600, 365, 2021, 'OHM', 'DAI')
    for(let i = 0; i < pair.length; ++i)
    {
        console.log(pair[i])
    }
    console.log(pair.length)
}

main()