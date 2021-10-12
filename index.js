import {getPairsDaysInfo, getPairsHoursInfo, getPairsMinuteInfo} from './pairs.js'

async function main()
{
    const pair = await getPairsHoursInfo(1628655757, 365, 2021, 'OHM', 'DAI')
    for(let i = 0; i < pair.length; ++i)
    {
        console.log(pair[i])
    }
}

main()