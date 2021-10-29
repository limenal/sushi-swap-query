# sushi-swap-ohm
This repository contains functions for sending requests to a custom Sushi Swap subgraph.
- Functions for getting swaps info for 1 day/1 hour/n hours/1 minute interval presented in pairs.js

## Install

    $ git clone https://github.com/limenal/sushi-swap-ohm
    $ cd sushi-swap-ohm
    $ npm install
    
## Running the project

    $ node index.js
## getPairsNHoursInfo() function

    Note that functions for N minutes or N days can also be implemented to create custom intervals such as 5m or 7d / 1w. After fetching data we need to iterate all time intervals like that: 
       
    for(let beginTimestamp = startTimestamp, endTimestamp = startTimestamp + N * timeInterval; beginTimestamp < endTime; beginTimestamp += N*timeInterval, endTimestamp+= N * timeInterval)
    {
      
      let obj = {
        beginTimestamp: beginTimestamp,
        endTimestamp: endTimestamp,
        //other data
      }
      for(let j = 0; j < data.length; ++j)
      {
        
        if(beginTimestamp <= data[j].timestamp && data[j].timestamp < endTimestamp)
        {

            // add items to object
        }
      }
      resultData.push(obj)
    }