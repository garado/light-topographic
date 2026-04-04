<img src="assets/images/example.png" alt="Example Template Screenshots">

<p>An outdoor maps app for the Light Phone III.</p>

## Features
- Map with layers for trails, roads, topographic contours, waterways, and labels
    - Individual layer visibility and color can be toggled
    - The map is powered by [OpenStreetMap](https://tiles.openstreetmap.us/), who is providing it for free. Everyone say thank you OpenStreetMap!
- Display current GPS location with directional indicator
- Load GPX routes for navigation

### Layers with adjustable toggle/color
    
<p align="center">
    <img src="./assets/images/layer-control.png">
</p>

<p align="center">
    <img src="assets/images/layers.gif" alt="Layers with adjustable toggle/color.">
</p>

### Named trails and labeled elevations

<p align="center">
    <img src="./assets/images/elevation-trail-labels.png">
</p>

## Known issues

The Light Phone's magnetometer (compass) is quite sensitive to outside interefence. This means that anything metal near the Light Phone can cause the directional indicator to lose accuracy. This includes a metal credit card in a DumbWireless case, which I found out after a very confusing debugging session.
