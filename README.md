# Welcome come to Ironhacks!

## Finding Home

[Link](https://jesusfchavarro.github.io/Finding-Home/)

A web app to find a safe and affordable place to rent near Department of Computer Science – University of Illinois, Chicago. I will use some interactive visualization to make easier make a choice.

I will visualize data in two ways, the first will be the standard way with charts and the second will be a map visualize data, e.g., heap maps

Keywords: near, housing, safety, open data, bicycle, facilities

### DataSets

- [Climate Data Online](https://www.ncdc.noaa.gov/cdo-web/) datasets:
  - [GHCND](https://www.ncdc.noaa.gov/oa/climate/ghcn-daily/) (Global Historical Climatology Network - Daily) - Reports of climate data (temperature, precipitation, wind speed) by day, is one of the most updated datasets in de NOAA's web API.

    Problems: A lot of [data types](https://www.ncdc.noaa.gov/cdo-web/webservices/v2#dataTypes) are missing, depends on the location.   
  - [Quality Controlled Local Climatological Data](https://www.ncdc.noaa.gov/data-access/land-based-station-data/land-based-datasets/quality-controlled-local-climatological-data-qclcd) A more detailed report of weather, with daily and hourly reports.

    Problems: This datasets don't have an web API, therefore, is difficult to get the data. The [Plenar.io API](http://docs.plenar.io/#get-v1-api-weather-daily) make easier to use this dataset

- [Affordable Rental Housing Developments](https://catalog.data.gov/dataset/affordable-rental-housing-developments-ef5c2) - Rental Housing data from Chicago

  Columns used: address, community_area, community_area_number, management_company, phone_number, property_name, property_type, zip_code

- [Crimes - 2001 to present](https://catalog.data.gov/dataset/crimes-2001-to-present-398a4) - This dataset reflects reported incidents of crime (with the exception of murders where data exists for each victim).

  Columns used: year, community_area, count(\*)

- [Boundaries - Community Areas](https://data.cityofchicago.org/Facilities-Geographic-Boundaries/Boundaries-Community-Areas-current-/cauq-8yn6) - Current community area boundaries in Chicago

  Columns used: community,area_numbe, the_geom

- [Fire Stations](https://data.cityofchicago.org/Public-Safety/Fire-Stations/28km-gtjn) - Fire station locations

  Columns used: address, location

- [Police Stations](https://data.cityofchicago.org/Public-Safety/Police-Stations/z8bn-74gv) - Chicago Police district station locations and contact information.

  columns used:  address, district, district_name, latitude, longitude, phone

- [Libraries Information](https://data.cityofchicago.org/Education/Libraries-Locations-Hours-and-Contact-Information/x8fc-8rcq) - Chicago Public Library locations, contact information, and hours of operation.

  columns used: address, location, phone, cybernavigator, teacher_in_the_library

- [Bikes Racks](https://data.cityofchicago.org/Transportation/Bike-Racks/cbyb-69xx) - Bike racks location in Chicago.

  columns used:location

- [Divvy Bicycle Stations](https://data.cityofchicago.org/Transportation/Divvy-Bicycle-Stations/bbyy-e7gq) - A list of the stations where one can pick up and return bicycles from the Divvy bicycle sharing system

  columns used:location, total_docks
- [Public Health Statistics- Selected public health indicators by Chicago community area](https://data.cityofchicago.org/Health-Human-Services/Public-Health-Statistics-Selected-public-health-in/iqnk-2tcu) - This dataset contains a selection of 27 indicators of public health significance by Chicago community area

  columns used:assault_homicide as homicide, diabetes_related as diabetes,firearm_related, infant_mortality_rate as infant_mortality, stroke_cerebrovascular_disease, tuberculosis, lung_cancer, unemployment


- Do you use the primary dataset ”online climate data” from data.gov? Yes
- Are all these datasets from data.gov or data.indy.gov? Yes


## Libraries

- [Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js): A map library like google maps.
- [D3.js](https://github.com/d3/d3): Is a JavaScript library for visualizing data using web standards. Also, include a statistic and  programing useful functions.
- [C3.js](https://github.com/c3js/c3): Is a D3-based reusable chart library that enables deeper integration of charts into web applications.
- [Highcharts JS](https://github.com/highcharts/highcharts): Is a JavaScript charting library based on SVG, with fallbacks to VML and canvas for old browsers.
- [JQuery](https://github.com/jquery/jquery): A library for DOM manipulation, animation, event handling, AJAX requests and more.
- [Soda js](https://github.com/socrata/soda-js): A client implementation of the Socrata Open Data API. -I have to modified a little to get GeoJson files
- [Plenar.io](https://github.com/UrbanCCD-UChicago/plenario): API for geospatial and time aggregation across multiple open datasets.
- [Semantic UI](https://github.com/semantic-org/semantic-ui/): Is a UI framework designed for theming and build beautiful websites.
- [D3 Plus](https://github.com/alexandersimoes/d3plus): A javascript library that extends D3.js to enable fast and beautiful visualizations.
- [FusionCharts](http://www.fusioncharts.com/): Is a javascript library that creates charts dynamically with svg.
## Project

With this App I try to use explore the D3 library and some others like C3, public datasets to make information to improve decisions, explore the options of integrate Mapbox with D3, and learn to make a useful web app with javascript.
## Map View
- Basic Map with specific location - Yes, Chicago
- Markers for location of houses - Yes, the map has markers for location of affordable rental housing
- Labels for house's names - Yes
- InfoWindow to show detail information of a houses - Yes, Popups
- Any other cover on the map (for example, cloud cover to show the weather effect) - Yes

## Data Visualization
- Use Graph? What is the type? (bar chart, pie chart, radar chart ...) - Yes, bar chart, pie chart, line chart, spline chart
- Any interaction available on the graph? Yes, remove and add data, change between charts, remove and overlapping layers in the map

## Interaction Form:

- Any information output? list them. (text field, text area, label, plain HTML ...) - No
- Any operation option (filters)? List them. (search markets, search vegetables, filter based on price, sort based on convenience ...) - yes, crime by year and community area, and more
- Any information input? List them. (comments, markers, user preference ...) - Yes
Interaction with Map? List them. (filter on price will affect map markers, sort on price will affect map markers, ...) - yes
- Interaction with data visualization? List them. (filter, sort, set variables ...) - Yes, filter

## Test Cases
- Chrome: works perfect
- Firefox: works perfect
- IE: the Map don't work 'cause a security problem
- Edge: the Map don't work 'cause a security problem

## Problems

With the Climate Data Online I found a lot of useful datasets and datatypes to make charts and more, but, almost all the datasets aren't update.  


## Author

Jesus Felipe Chavarro Muñoz <br>
jfchavarrom@unal.edu.co <br>
jesusfchavarro@gmail.com
