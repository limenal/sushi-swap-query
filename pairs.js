import axios from 'axios'

/**

    * @dev : Get pairs (days)
    * @param startTimestamp - Start timestamp for query 
    * @param endTime - End timestamp for query
    * @param token0 - Token0 symbol e.g. OHM
    * @param token1 - Token1 symbol e.g. DAI

*/
export async function getPairsInfoDays(startTimestamp, endTime, token0, token1)
{
  let findPairQuery = 
  `{
    pairs(where:{name_in:["${token0}-` + `${token1}"]})
    {
      id
    }
  }
  `
    
    try
    {
      const findPair = await axios({
        url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
        method: 'post',
        data: {
          query: findPairQuery
        }
      })
      let id = findPair.data.data.pairs[0].id
      let pairName
      if(id !== undefined)
      {
        pairName = token0 + '-' + token1
      }
      else
      {
        pairName = token1 + '-' + token0
      }
      let query = `
      {	
          pairYears(first: 5 where:{name:"${pairName}"}){
            dayPair(first:365, orderBy:timestamp where:{timestamp_gte: ${startTimestamp}, timestamp_lt:${endTime} })
            {
                  token1Price
                  token1PriceLow
                  token1PriceOpen
                  token1PriceHigh
                  timestamp
                  volumeToken0In
                  volumeToken0Out
                  volumeToken1In
                  volumeToken1Out
              }
          }
        }
      
      `
      const pairData = await axios({
          url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
          method: 'post',
          data: {
            query: query
          }
      }) 
      const pair = pairData.data.data.pairYears
      let data = []
      let pairs = []
      let [prevToken1PriceOpen, prevToken1PriceClose] = [0, 0]

      for(let c = 0; c < pair.length; ++c)
      {
        for(let i = 0; i < pair[c].dayPair.length; ++i)
        {
            let obj = {}
            obj.token1PriceClose = pair[c].dayPair[i].token1Price
            obj.token1PriceLow = pair[c].dayPair[i].token1PriceLow
            obj.token1PriceOpen = pair[c].dayPair[i].token1PriceOpen
            obj.token1PriceHigh = pair[c].dayPair[i].token1PriceHigh
            obj.timestamp = pair[c].dayPair[i].timestamp
            obj.volumeToken1In = pair[c].dayPair[i].volumeToken1In
            obj.volumeToken1Out = pair[c].dayPair[i].volumeToken1Out
            pairs.push(obj)
        }
      }
      let beginTimestamp = startTimestamp
      let endTimestamp = startTimestamp + 86400
      let startIndexingTimestamp = 0
      
      for(let j = 0; j < pairs.length; ++j)
      {
        if(beginTimestamp <= Number(pairs[j].timestamp) && Number(pairs[j].timestamp) < endTimestamp)
        {
          let obj = {
            beginTimestamp: beginTimestamp,
            endTimestamp: endTimestamp,
            token1PriceOpen: pairs[j].token1PriceOpen,
            token1PriceClose: pairs[j].token1PriceClose,
            token1PriceHigh: pairs[j].token1PriceHigh,
            token1PriceLow: pairs[j].token1PriceLow,
            volumeToken1In: pairs[j].volumeToken1In,
            volumeToken1Out: pairs[j].volumeToken1Out,
            timestamp: pairs[j].timestamp
          }
          prevToken1PriceOpen = pairs[j].token1PriceOpen
          prevToken1PriceClose = pairs[j].token1PriceClose

          beginTimestamp += 86400
          endTimestamp += 86400
        
          if(startIndexingTimestamp === 0)
          {
            startIndexingTimestamp = pairs[j].timestamp
          }
          data.push(obj)  
        }
        else
        {
          while(endTimestamp <= Number(pairs[j].timestamp))
          {
            let obj = {
              beginTimestamp: beginTimestamp,
              endTimestamp: endTimestamp,
              token1PriceOpen: prevToken1PriceClose,
              token1PriceClose: prevToken1PriceClose,
              token1PriceHigh: prevToken1PriceClose,
              token1PriceLow: prevToken1PriceClose,
              volumeToken1In: 0,
              volumeToken1Out:0,
            }
            
            data.push(obj)
            
            beginTimestamp += 86400
            endTimestamp += 86400
            
          }
          if(beginTimestamp <= Number(pairs[j].timestamp) && Number(pairs[j].timestamp) < endTimestamp )
          {
            let objTmp = {
              beginTimestamp: beginTimestamp,
              endTimestamp: endTimestamp,
              token1PriceOpen: pairs[j].token1PriceOpen,
              token1PriceClose: pairs[j].token1PriceClose,
              token1PriceHigh: pairs[j].token1PriceHigh,
              token1PriceLow: pairs[j].token1PriceLow,
              volumeToken1In: pairs[j].volumeToken1In,
              volumeToken1Out: pairs[j].volumeToken1Out,
              timestamp: pairs[j].timestamp
            }
            prevToken1PriceOpen = pairs[j].token1PriceOpen
            prevToken1PriceClose = pairs[j].token1PriceClose
  
            beginTimestamp += 86400
            endTimestamp += 86400
            
            data.push(objTmp)
          }
          
        }
      }
      while(data.length < (endTime - startTimestamp) / (60*60*24))
      {
        data.push(
          {
            beginTimestamp: beginTimestamp,
            endTimestamp: endTimestamp,
            token1PriceOpen: prevToken1PriceClose,
            token1PriceClose: prevToken1PriceClose,
            token1PriceHigh: prevToken1PriceClose,
            token1PriceLow: prevToken1PriceClose,
            volumeToken1In: 0,
            volumeToken1Out:0,
          }
        )
        beginTimestamp += 86400
        endTimestamp += 86400
      }
      
      return data
    }
    catch(err)
    {
        console.log(err)
    }
}

/**
    * @dev : Get pairs (N days)
    * @param startTimestamp - Start timestamp for query 
    * @param endTime - End timestamp for query
    * @param token0 - Token0 symbol e.g. OHM
    * @param token1 - Token1 symbol e.g. DAI
    * @param days - Number of days

*/
export async function getPairsInfoNDays(startTimestamp, endTime, token0, token1, days)
{
  let findPairQuery = 
  `{
    pairs(where:{name_in:["${token0}-` + `${token1}"]})
    {
      id
    }
  }
  `

  
  try
  {
    const findPair = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: findPairQuery
      }
    })
    let id = findPair.data.data.pairs[0].id
    let pairName
    if(id !== undefined)
    {
      pairName = token0 + '-' + token1
    }
    else
    {
      pairName = token1 + '-' + token0
    }
    let query = `
    {	
      pairYears(first: 5 where:{name:"${pairName}"}){
        dayPair(first:365, orderBy:timestamp where:{timestamp_gte: ${startTimestamp}, timestamp_lt:${endTime} })
        {
          
            token1Price
            token1PriceLow
            token1PriceOpen
            token1PriceHigh
            timestamp
            volumeToken0In
            volumeToken0Out
            volumeToken1In
            volumeToken1Out
          
        }
      }
    }
    `
    console.log(Date())
    const pairData = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: query
      }
    }) 
    console.log(Date())
    const pair = pairData.data.data.pairYears
    let data = []
    let pairs = []
    for(let c = 0; c < pair.length; ++c)
    {
      for(let i = 0; i < pair[c].dayPair.length; ++i)
      {
        
          let obj = {}
          obj.token1PriceClose = pair[c].dayPair[i].token1Price
          obj.token1PriceLow = pair[c].dayPair[i].token1PriceLow
          obj.token1PriceOpen = pair[c].dayPair[i].token1PriceOpen
          obj.token1PriceHigh = pair[c].dayPair[i].token1PriceHigh
          obj.timestamp = pair[c].dayPair[i].timestamp
          obj.volumeToken1In = pair[c].dayPair[i].volumeToken1In
          obj.volumeToken1Out = pair[c].dayPair[i].volumeToken1Out
          pairs.push(obj)
        
      }
    }
    let [prevToken1PriceOpen, prevToken1PriceClose, prevToken1PriceHigh, prevToken1PriceLow, prevVolumeToken1In, prevVolumeToken1Out] =
    [0, 0, 0, 0, 0, 0]

    for(let beginTimestamp = startTimestamp, endTimestamp = startTimestamp + days*86400; beginTimestamp < endTime; beginTimestamp += days*86400, endTimestamp += days*86400)
    {
      
      let obj = {
        beginTimestamp: beginTimestamp,
        endTimestamp: endTimestamp,
        token1PriceOpen: prevToken1PriceClose,
        token1PriceClose: prevToken1PriceClose,
        token1PriceHigh: prevToken1PriceClose,
        token1PriceLow: prevToken1PriceClose,
        volumeToken1In: 0,
        volumeToken1Out:0,
      }
      let isOpen = false
      for(let j = 0; j < pairs.length; ++j)
      {
        
        if(beginTimestamp <= pairs[j].timestamp && pairs[j].timestamp < endTimestamp)
        {

          obj.token1PriceClose = Number(pairs[j].token1PriceClose)
          prevToken1PriceClose = Number(pairs[j].token1PriceClose)
          if(!isOpen)
          {
            obj.token1PriceOpen = Number(pairs[j].token1PriceOpen)
            obj.token1PriceLow = Number(pairs[j].token1PriceLow)
            isOpen = true
            prevToken1PriceOpen = Number(pairs[j].token1PriceOpen)
          }
          
          if(Number(pairs[j].token1PriceHigh) > obj.token1PriceHigh)
          {
            obj.token1PriceHigh = Number(pairs[j].token1PriceHigh)
          }
          if(Number(pairs[j].token1PriceLow) < obj.token1PriceLow)
          {
            obj.token1PriceLow = Number(pairs[j].token1PriceLow)
          }
          obj.volumeToken1In += Number(pairs[j].volumeToken1In)
          obj.volumeToken1Out += Number(pairs[j].volumeToken1Out)
        }
      }
      data.push(obj)
    }
    return data;
  }
  catch(err)
  {
    console.log(err)
  }
}


/**

    * @dev : Get pairs (hours)
    * @param startTimestamp - Start timestamp for query 
    * @param endTime - End timestamp for query
    * @param token0 - Token0 symbol e.g. OHM
    * @param token1 - Token1 symbol e.g. DAI

*/
export async function getPairsInfoHours(startTimestamp, endTime, token0, token1)
{
  let findPairQuery = 
  `{
    pairs(where:{name_in:["${token0}-` + `${token1}"]})
    {
      id
    }
  }
  `

  
  try
  {
    const findPair = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: findPairQuery
      }
    })
    let id = findPair.data.data.pairs[0].id
    let pairName
    if(id !== undefined)
    {
      pairName = token0 + '-' + token1
    }
    else
    {
      pairName = token1 + '-' + token0
    }
    let query = `
    {	
      pairYears(first: 5 where:{name:"${pairName}"}){
        dayPair(first:365, orderBy:timestamp where:{timestamp_gte: ${startTimestamp}, timestamp_lt:${endTime} })
        {
          hourPair(first:24 orderBy:timestamp)
          {
            token1Price
            token1PriceLow
            token1PriceOpen
            token1PriceHigh
            timestamp
            volumeToken0In
            volumeToken0Out
            volumeToken1In
            volumeToken1Out
          }
        }
      }
    }
    `
    console.log(Date())
    const pairData = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: query
      }
    }) 
    console.log(Date())
    const pair = pairData.data.data.pairYears
    let data = []
    let pairs = []
    for(let c = 0; c < pair.length; ++c)
    {
      for(let i = 0; i < pair[c].dayPair.length; ++i)
      {
        for(let j = 0; j < pair[c].dayPair[i].hourPair.length; ++j)
        {
          let obj = {}
          obj.token1PriceClose = pair[c].dayPair[i].hourPair[j].token1Price
          obj.token1PriceLow = pair[c].dayPair[i].hourPair[j].token1PriceLow
          obj.token1PriceOpen = pair[c].dayPair[i].hourPair[j].token1PriceOpen
          obj.token1PriceHigh = pair[c].dayPair[i].hourPair[j].token1PriceHigh
          obj.timestamp = pair[c].dayPair[i].hourPair[j].timestamp
          obj.volumeToken1In = pair[c].dayPair[i].hourPair[j].volumeToken1In
          obj.volumeToken1Out = pair[c].dayPair[i].hourPair[j].volumeToken1Out
          pairs.push(obj)
        }
      }
    }
    let beginTimestamp = startTimestamp
    let endTimestamp = startTimestamp + 3600
    let startIndexingTimestamp = 0
    let [prevToken1PriceOpen, prevToken1PriceClose, prevToken1PriceHigh, prevToken1PriceLow, prevVolumeToken1In, prevVolumeToken1Out] =
    [0, 0, 0, 0, 0, 0]

    for(let j = 0; j < pairs.length; ++j)
    {
      if(beginTimestamp <= Number(pairs[j].timestamp) && Number(pairs[j].timestamp) < endTimestamp)
      {
        let obj = {
          beginTimestamp: beginTimestamp,
          endTimestamp: endTimestamp,
          token1PriceOpen: pairs[j].token1PriceOpen,
          token1PriceClose: pairs[j].token1PriceClose,
          token1PriceHigh: pairs[j].token1PriceHigh,
          token1PriceLow: pairs[j].token1PriceLow,
          volumeToken1In: pairs[j].volumeToken1In,
          volumeToken1Out: pairs[j].volumeToken1Out,
          timestamp: pairs[j].timestamp
        }
        prevToken1PriceOpen = pairs[j].token1PriceOpen
        prevToken1PriceClose = pairs[j].token1PriceClose

        beginTimestamp += 3600
        endTimestamp += 3600

        if(startIndexingTimestamp === 0)
        {
          startIndexingTimestamp = pairs[j].timestamp
        }
        data.push(obj)  
      }
      else
      {
        while(endTimestamp <= Number(pairs[j].timestamp))
        {
          let obj = {
            beginTimestamp: beginTimestamp,
            endTimestamp: endTimestamp,
            token1PriceOpen: prevToken1PriceClose,
            token1PriceClose: prevToken1PriceClose,
            token1PriceHigh: prevToken1PriceClose,
            token1PriceLow: prevToken1PriceClose,
            volumeToken1In: 0,
            volumeToken1Out:0,
          }
          
          data.push(obj)
          
          beginTimestamp += 3600
          endTimestamp += 3600
          
        }
        if(beginTimestamp <= Number(pairs[j].timestamp) && Number(pairs[j].timestamp) < endTimestamp )
        {
          let objTmp = {
            beginTimestamp: beginTimestamp,
            endTimestamp: endTimestamp,
            token1PriceOpen: pairs[j].token1PriceOpen,
            token1PriceClose: pairs[j].token1PriceClose,
            token1PriceHigh: pairs[j].token1PriceHigh,
            token1PriceLow: pairs[j].token1PriceLow,
            volumeToken1In: pairs[j].volumeToken1In,
            volumeToken1Out: pairs[j].volumeToken1Out,
            timestamp: pairs[j].timestamp
          }
          prevToken1PriceOpen = pairs[j].token1PriceOpen
          prevToken1PriceClose = pairs[j].token1PriceClose

          beginTimestamp += 3600
          endTimestamp += 3600
          
          data.push(objTmp)
        }
        
      }
    }
    while(data.length < (endTime - startTimestamp) / (60*60))
    {
      data.push(
        {
          beginTimestamp: beginTimestamp,
          endTimestamp: endTimestamp,
          token1PriceOpen: prevToken1PriceClose,
          token1PriceClose: prevToken1PriceClose,
          token1PriceHigh: prevToken1PriceClose,
          token1PriceLow: prevToken1PriceClose,
          volumeToken1In: 0,
          volumeToken1Out:0,
        }
      )
      beginTimestamp += 3600
      endTimestamp += 3600
    }
    console.log(Date())
    return data;
  }
  catch(err)
  {

  }
}
/**

    * @dev : Get pairs (N hours)
    * @param startTimestamp - Start timestamp for query 
    * @param endTime - End timestamp for query
    * @param token0 - Token0 symbol e.g. OHM
    * @param token1 - Token1 symbol e.g. DAI
    * @param hours - Number of hours

*/
export async function getPairsInfoNHours(startTimestamp, endTime, token0, token1, hours)
{
  let findPairQuery = 
  `{
    pairs(where:{name_in:["${token0}-` + `${token1}"]})
    {
      id
    }
  }
  `

  
  try
  {
    const findPair = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: findPairQuery
      }
    })
    let id = findPair.data.data.pairs[0].id
    let pairName
    if(id !== undefined)
    {
      pairName = token0 + '-' + token1
    }
    else
    {
      pairName = token1 + '-' + token0
    }
    let query = `
    {	
      pairYears(first: 5 where:{name:"${pairName}"}){
        dayPair(first:365, orderBy:timestamp where:{timestamp_gte: ${startTimestamp}, timestamp_lt:${endTime} })
        {
          hourPair(first:24 orderBy:timestamp)
          {
            token1Price
            token1PriceLow
            token1PriceOpen
            token1PriceHigh
            timestamp
            volumeToken0In
            volumeToken0Out
            volumeToken1In
            volumeToken1Out
          }
        }
      }
    }
    `
    console.log(Date())
    const pairData = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: query
      }
    }) 
    console.log(Date())
    const pair = pairData.data.data.pairYears
    let data = []
    let pairs = []
    for(let c = 0; c < pair.length; ++c)
    {
      for(let i = 0; i < pair[c].dayPair.length; ++i)
      {
        for(let j = 0; j < pair[c].dayPair[i].hourPair.length; ++j)
        {
          let obj = {}
          obj.token1PriceClose = pair[c].dayPair[i].hourPair[j].token1Price
          obj.token1PriceLow = pair[c].dayPair[i].hourPair[j].token1PriceLow
          obj.token1PriceOpen = pair[c].dayPair[i].hourPair[j].token1PriceOpen
          obj.token1PriceHigh = pair[c].dayPair[i].hourPair[j].token1PriceHigh
          obj.timestamp = pair[c].dayPair[i].hourPair[j].timestamp
          obj.volumeToken1In = pair[c].dayPair[i].hourPair[j].volumeToken1In
          obj.volumeToken1Out = pair[c].dayPair[i].hourPair[j].volumeToken1Out
          pairs.push(obj)
        }
      }
    }
    let [prevToken1PriceOpen, prevToken1PriceClose, prevToken1PriceHigh, prevToken1PriceLow, prevVolumeToken1In, prevVolumeToken1Out] =
    [0, 0, 0, 0, 0, 0]

    for(let beginTimestamp = startTimestamp, endTimestamp = startTimestamp + hours*3600; beginTimestamp < endTime; beginTimestamp += hours*3600, endTimestamp+=hours*3600)
    {
      
      let obj = {
        beginTimestamp: beginTimestamp,
        endTimestamp: endTimestamp,
        token1PriceOpen: prevToken1PriceClose,
        token1PriceClose: prevToken1PriceClose,
        token1PriceHigh: prevToken1PriceClose,
        token1PriceLow: prevToken1PriceClose,
        volumeToken1In: 0,
        volumeToken1Out:0,
      }
      let isOpen = false
      for(let j = 0; j < pairs.length; ++j)
      {
        
        if(beginTimestamp <= pairs[j].timestamp && pairs[j].timestamp < endTimestamp)
        {

          obj.token1PriceClose = Number(pairs[j].token1PriceClose)
          prevToken1PriceClose = Number(pairs[j].token1PriceClose)

          if(!isOpen)
          {
            obj.token1PriceOpen = Number(pairs[j].token1PriceOpen)
            obj.token1PriceLow = Number(pairs[j].token1PriceLow)
            isOpen = true
            prevToken1PriceOpen = Number(pairs[j].token1PriceOpen)
          }
          
          if(Number(pairs[j].token1PriceHigh) > obj.token1PriceHigh)
          {
            obj.token1PriceHigh = Number(pairs[j].token1PriceHigh)
          }
          if(Number(pairs[j].token1PriceLow) < obj.token1PriceLow)
          {
            obj.token1PriceLow = Number(pairs[j].token1PriceLow)
          }
          obj.volumeToken1In += Number(pairs[j].volumeToken1In)
          obj.volumeToken1Out += Number(pairs[j].volumeToken1Out)
        }
      }
      
      data.push(obj)
    
    }

    return data;
  }
  catch(err)
  {
    console.log(err)
  }
}
/**

    * @dev : Get pairs (minutes)
    * @param startTimestamp - Start timestamp for query 
    * @param endTime - End timestamp for query
    * @param token0 - Token0 symbol e.g. OHM
    * @param token1 - Token1 symbol e.g. DAI

*/
export async function getPairsInfoMinutes(startTimestamp, endTime, token0, token1)
{
  let findPairQuery = 
  `{
    pairs(where:{name_in:["${token0}-` + `${token1}"]})
    {
      id
    }
  }
  `

  try
  {
    const findPair = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: findPairQuery
      }
    })
    let id = findPair.data.data.pairs[0].id
    let pairName
    if(id !== undefined)
    {
      pairName = token0 + '-' + token1
    }
    else
    {
      pairName = token1 + '-' + token0
    }

    let query = `
  {	
    pairYears(first: 1 where:{name:"${pairName}"}){
      dayPair(first:365, orderBy:timestamp where:{timestamp_gte: ${startTimestamp}, timestamp_lt:${endTime} } )
      {
        hourPair(first:24 orderBy:timestamp)
        {
          minutePair(first:60 orderBy:timestamp)
          {
            token1Price
            token1PriceLow
            token1PriceOpen
            token1PriceHigh
            timestamp
            volumeToken0In
            volumeToken0Out
            volumeToken1In
            volumeToken1Out
          }
        }
      }
    }
  }
  `
    console.log(Date())
    const pairData = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: query
      }
    })
    console.log(Date())
    
    const pair = pairData.data.data.pairYears
    let data = []
    let pairs = []
    for(let c = 0; c < pair.length; ++c)
    {
      for(let i = 0; i < pair[c].dayPair.length; ++i)
      {
        for(let j = 0; j < pair[c].dayPair[i].hourPair.length; ++j)
        {
          for(let k = 0; k < pair[c].dayPair[i].hourPair[j].minutePair.length; ++k)
          {
            let obj = {}
            obj.token1PriceClose = pair[c].dayPair[i].hourPair[j].minutePair[k].token1Price
            obj.token1PriceLow = pair[c].dayPair[i].hourPair[j].minutePair[k].token1PriceLow
            obj.token1PriceOpen = pair[c].dayPair[i].hourPair[j].minutePair[k].token1PriceOpen
            obj.token1PriceHigh = pair[c].dayPair[i].hourPair[j].minutePair[k].token1PriceHigh
            obj.timestamp = pair[c].dayPair[i].hourPair[j].minutePair[k].timestamp
            obj.volumeToken1In = pair[c].dayPair[i].hourPair[j].minutePair[k].volumeToken1In
            obj.volumeToken1Out = pair[c].dayPair[i].hourPair[j].minutePair[k].volumeToken1Out
            pairs.push(obj)
          }
        }
      }
    }
    // // 
    let beginTimestamp = startTimestamp
    let endTimestamp = startTimestamp + 60
    let startIndexingTimestamp = 0
    let [prevToken1PriceOpen, prevToken1PriceClose, prevToken1PriceHigh, prevToken1PriceLow, prevVolumeToken1In, prevVolumeToken1Out] =
    [0, 0, 0, 0, 0, 0]
    for(let j = 0; j < pairs.length; ++j)
    {
      if(beginTimestamp <= Number(pairs[j].timestamp) && Number(pairs[j].timestamp) < endTimestamp)
      {
        let obj = {
          beginTimestamp: beginTimestamp,
          endTimestamp: endTimestamp,
          token1PriceOpen: pairs[j].token1PriceOpen,
          token1PriceClose: pairs[j].token1PriceClose,
          token1PriceHigh: pairs[j].token1PriceHigh,
          token1PriceLow: pairs[j].token1PriceLow,
          volumeToken1In: pairs[j].volumeToken1In,
          volumeToken1Out: pairs[j].volumeToken1Out,
          timestamp: pairs[j].timestamp
        }
        prevToken1PriceOpen = pairs[j].token1PriceOpen
        prevToken1PriceClose = pairs[j].token1PriceClose
        beginTimestamp += 60
        endTimestamp += 60

        if(startIndexingTimestamp === 0)
        {
          startIndexingTimestamp = pairs[j].timestamp
        }
        data.push(obj)  
      }
      else
      {
        while(endTimestamp <= Number(pairs[j].timestamp))
        {
          let obj = {
            beginTimestamp: beginTimestamp,
            endTimestamp: endTimestamp,
            token1PriceOpen: prevToken1PriceClose,
            token1PriceClose: prevToken1PriceClose,
            token1PriceHigh: prevToken1PriceClose,
            token1PriceLow: prevToken1PriceClose,
            volumeToken1In: 0,
            volumeToken1Out: 0,
          }
          
          data.push(obj)
          
          beginTimestamp += 60
          endTimestamp += 60
          
        }
        if(beginTimestamp <= Number(pairs[j].timestamp) && Number(pairs[j].timestamp) < endTimestamp )
        {
          let objTmp = {
            beginTimestamp: beginTimestamp,
            endTimestamp: endTimestamp,
            token1PriceOpen: pairs[j].token1PriceOpen,
            token1PriceClose: pairs[j].token1PriceClose,
            token1PriceHigh: pairs[j].token1PriceHigh,
            token1PriceLow: pairs[j].token1PriceLow,
            volumeToken1In: pairs[j].volumeToken1In,
            volumeToken1Out: pairs[j].volumeToken1Out,
            timestamp: pairs[j].timestamp
          }
          prevToken1PriceOpen = pairs[j].token1PriceOpen
          prevToken1PriceClose = pairs[j].token1PriceClose
  
          beginTimestamp += 60
          endTimestamp += 60
          
          data.push(objTmp)
        }
        
      }
    }
    while(data.length < (endTime - startTimestamp) / 60)
    {
      data.push(
        {
          beginTimestamp: beginTimestamp,
          endTimestamp: endTimestamp,
          token1PriceOpen: prevToken1PriceClose,
          token1PriceClose: prevToken1PriceClose,
          token1PriceHigh: prevToken1PriceClose,
          token1PriceLow: prevToken1PriceClose,
          volumeToken1In: 0,
          volumeToken1Out:0,
        }
      )
      beginTimestamp += 60
      endTimestamp += 60
    }
    console.log(Date())
    return data;
  }
  catch(err)
  {
    console.log(err)
  }
}

/**
    * @dev : Get pairs (N minutes)
    * @param startTimestamp - Start timestamp for query 
    * @param endTime - End timestamp for query
    * @param token0 - Token0 symbol e.g. OHM
    * @param token1 - Token1 symbol e.g. DAI
    * @param minutes - Number of minutes

*/
export async function getPairsInfoNMinutes(startTimestamp, endTime, token0, token1, minutes)
{
  let findPairQuery = 
  `{
    pairs(where:{name_in:["${token0}-` + `${token1}"]})
    {
      id
    }
  }
  `

  
  try
  {
    const findPair = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: findPairQuery
      }
    })
    let id = findPair.data.data.pairs[0].id
    let pairName
    if(id !== undefined)
    {
      pairName = token0 + '-' + token1
    }
    else
    {
      pairName = token1 + '-' + token0
    }
    let query = `
    {	
      pairYears(first: 5 where:{name:"${pairName}"}){
        dayPair(first:365, orderBy:timestamp where:{timestamp_gte: ${startTimestamp}, timestamp_lt:${endTime} })
        {
          hourPair(first:24 orderBy:timestamp)
        {
          minutePair(first:60 orderBy:timestamp)
          {
            token1Price
            token1PriceLow
            token1PriceOpen
            token1PriceHigh
            timestamp
            volumeToken0In
            volumeToken0Out
            volumeToken1In
            volumeToken1Out
          }
        }
          
        }
      }
    }
    `
    const pairData = await axios({
      url: 'https://api.thegraph.com/subgraphs/name/limenal/sushi-swap-ohm',
      method: 'post',
      data: {
        query: query
      }
    }) 
    console.log(Date())
    const pair = pairData.data.data.pairYears
    let data = []
    let pairs = []
    for(let c = 0; c < pair.length; ++c)
    {
      for(let i = 0; i < pair[c].dayPair.length; ++i)
      {
        for(let j = 0; j < pair[c].dayPair[i].hourPair.length; ++j)
        {
          for(let k = 0; k < pair[c].dayPair[i].hourPair[j].minutePair.length; ++k)
          {
            let obj = {}
            obj.token1PriceClose = pair[c].dayPair[i].hourPair[j].minutePair[k].token1Price
            obj.token1PriceLow = pair[c].dayPair[i].hourPair[j].minutePair[k].token1PriceLow
            obj.token1PriceOpen = pair[c].dayPair[i].hourPair[j].minutePair[k].token1PriceOpen
            obj.token1PriceHigh = pair[c].dayPair[i].hourPair[j].minutePair[k].token1PriceHigh
            obj.timestamp = pair[c].dayPair[i].hourPair[j].minutePair[k].timestamp
            obj.volumeToken1In = pair[c].dayPair[i].hourPair[j].minutePair[k].volumeToken1In
            obj.volumeToken1Out = pair[c].dayPair[i].hourPair[j].minutePair[k].volumeToken1Out
            pairs.push(obj)
          }
        }
      }
    }
    // let prevToken1PriceOpen = 0, prevToken1PriceClose = 0
    let [prevToken1PriceOpen, prevToken1PriceClose] =
    [0, 0]
    for(let beginTimestamp = startTimestamp, endTimestamp = startTimestamp + minutes*60; beginTimestamp < endTime; beginTimestamp += minutes*60, endTimestamp += minutes*60)
    {
      
      let obj = {
        beginTimestamp: beginTimestamp,
        endTimestamp: endTimestamp,
        token1PriceOpen: prevToken1PriceClose,
        token1PriceClose: prevToken1PriceClose,
        token1PriceHigh: prevToken1PriceClose,
        token1PriceLow: prevToken1PriceClose,
        volumeToken1In: 0,
        volumeToken1Out:0,
      }
      let isOpen = false
      for(let j = 0; j < pairs.length; ++j)
      {
        
        if(beginTimestamp <= pairs[j].timestamp && pairs[j].timestamp < endTimestamp)
        {
          
          obj.token1PriceClose = Number(pairs[j].token1PriceClose)
          prevToken1PriceClose = Number(pairs[j].token1PriceClose)
          if(!isOpen)
          {
            prevToken1PriceOpen = Number(pairs[j].token1PriceOpen)
            obj.token1PriceOpen = Number(pairs[j].token1PriceOpen)
            obj.token1PriceLow = Number(pairs[j].token1PriceLow)
            isOpen = true
          }
          
          if(Number(pairs[j].token1PriceHigh) > obj.token1PriceHigh)
          {
            obj.token1PriceHigh = Number(pairs[j].token1PriceHigh)
          }
          if(Number(pairs[j].token1PriceLow) < obj.token1PriceLow)
          {
            obj.token1PriceLow = Number(pairs[j].token1PriceLow)
          }
          obj.volumeToken1In += Number(pairs[j].volumeToken1In)
          obj.volumeToken1Out += Number(pairs[j].volumeToken1Out)
        }
      }
      data.push(obj)
    }
    return data;
  }
  catch(err)
  {
    console.log(err)
  }
}
