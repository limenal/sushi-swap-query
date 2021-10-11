import {getPairsDaysInfo, getPairsHoursInfo} from './pairs.js'

async function main()
{
    const pairDays = await getPairsHoursInfo(1615232988, 24)
    
    for(let i = 0; i < pairDays.length; ++i)
    {
        
        console.log(pairDays[i])
    }
}

main()