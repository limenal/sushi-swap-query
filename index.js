import {getPairsDaysInfo, getPairsHoursInfo, getPairsMinuteInfo} from './pairs.js'

async function main()
{
    const pair = await getPairsMinuteInfo(1628655757, 1)
    
    for(let i = 0; i < pair.length; ++i)
    {
        
        console.log(pair[i])
    }
}

main()