Jazzy Data Visualization
=============
The main goal of this app is to allow exploration of the dataset and analyze patterns of change in arts over the years. This data comes from a survey of the National Endowment for the Arts (NEA) and is made publicly available for a data visualization challenge. The goal of this challenge is to receive visualizations that supply answers to questions such as: What role do the arts play in communities across the country? How has arts participation changed over time? What are some of the possible explanations for shifts in participation patterns? 

We have created an app that allows for interactive visualizations that facilitate the user to find answers to such questions. By using the d3js library we have made an interactive map of the United States that allows the user to explore the arts participation of the different states over time. From this interactive map interesting changes may be identified and selected. These interesting states may then be selected to be explored further with more detailed visualizations that show the different communities and groups within the population of the selected state. 

## Usage and Features

### Prepare
1. Clone the repo and run index.html. From a webserver, otherwise the data cannot be loaded caused by XSS browser security.

### Quick difference between states
2. Select one or more filters to the right
3. The colors in the maps show the combined values in % [white (min) > blue (max)]
4. A quick comparison between states and years can be done by viewing the color difference between them

### Quick difference in time
4. Hover the states to show the computed value in %
5. The same state in the other maps light up and show the difference in value
6. The color of the tooltip change for the difference in value [red (min) > grey (zero) > green (max)]

### In-detaile comparison between states and time
5. Click to select multiple states 
6. The lower left corner shows the selected states
7. Click on this list to open up a selection form where you can select chart types and other variables for detailed comparison 

## Implementation details

For this app we used [data](http://arts.gov/publications/additional-materials-related-to-2012-sppa) from the US Government for a Visualisation Challenge. We used [Bootstrap](http://www.getbootstrap.com) for basic styling and [jQuery](http:www.jquery.com) for basic dom manipulation. [D3js](http://www.d3js.org) is used for visualisation in svg object in javascript. 

The following examples were used as inspiration. [Parallel Sets](https://github.com/jasondavies/d3-parsets), [Pie](http://bl.ocks.org/mbostock/1346410), [Bar](http://bl.ocks.org/mbostock/882152), [US Map](https://vida.io/documents/4YnyrFvSguafuSjWj) 



