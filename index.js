import {getDaysInfo} from './pairs.js'

async function main()
{
    const pairDays = await getDaysInfo(1615232988, 200)
    
    for(let i = 0; i < pairDays.length; ++i)
    {
        
        console.log(pairDays[i])
    }
}

main()