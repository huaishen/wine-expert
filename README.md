# Wine Expert

This repo is for the course project of NUS CS5346 S2 AY2020/21. 

The final outcome is available at https://huaishen.github.io/wine-expert/.

Contributions by: Li Huaishen, Zhu Hongning, Yang Yutong

## Introduction

Wine is no doubt an important constituent of western culture. It is common to see a long list of wines on restaurant menus or wine as a gift on celebration occasions. However, as ordinary people without prior exposure to wine knowledge, we may feel dazzled by all sorts of wine names in wine stores or restaurants and confused about different wines’ styles and tastes. 

We want to use data visualization techniques to reveal some interesting facts about wine and evaluate wine varieties with multiple dimensions. Geographical visualization, network visualization, radar chart, and radial tree diagram are utilized to display patterns from unique perspectives. Wine enthusiasts may also benefit from our interactive visualization feature by discovering wines suitable for their own taste preferences.

## Visualization 

In total, we have 4 sets of visualization - **Wine map, Taste radar, Grape-style Chord, Food pair network**. The adjustable navigation bar is on the left side of the webpage. The user can click on each row to switch the view, and the default page is Wine map. 

### Wine Map

#### Choropleth Map
<img src="/docs/choropleth.png" />

#### Country-specific Dashboard 

<img src="/docs/country_dashboard.png" />

#### Markercluster Donut Chart 

<img src="/docs/cluster_donut.png" />

### Taste Radar

<img src="/docs/taste_radar.png" />

### Grape-Style Chord

<img src="/docs/chord.png" />

### Food Pair Network 

<img src="/docs/food_pair.png" />

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run deploy`

The app will be built and deployed via Github Pages on the URL specified as homepage in package.json

