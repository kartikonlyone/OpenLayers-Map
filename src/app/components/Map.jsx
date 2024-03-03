"use client";
import React, { useState, useEffect } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Draw } from 'ol/interaction';
import { getLength, getArea } from 'ol/sphere';
import { Style, Stroke, Fill } from 'ol/style';

const MapWithInteractions = () => {
    const [map, setMap] = useState(null);
    const [drawInteraction, setDrawInteraction] = useState(null);
    const [vectorSource, setVectorSource] = useState(null);
    const [area, setArea] = useState(null);
    const [length, setLength] = useState(null);

    useEffect(() => {
        const mapInstance = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    source: new OSM()
                })
            ],
            view: new View({
                center: [0, 0],
                zoom: 2
            })
        });

        const source = new VectorSource();
        const layer = new VectorLayer({
            source: source,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 2
                })
            })
        });

        mapInstance.addLayer(layer);

        setMap(mapInstance);
        setVectorSource(source);

        return () => {
            mapInstance.setTarget(null);
            mapInstance.dispose();
        };
    }, []);

    const handleDrawType = (type) => {
        if (map && drawInteraction) {
            map.removeInteraction(drawInteraction);
        }
        if (vectorSource) {
            const draw = new Draw({
                source: vectorSource,
                type: type
            });
            map.addInteraction(draw);
            setDrawInteraction(draw);

            draw.on('drawend', (event) => {
                const feature = event.feature;
                const geometry = feature.getGeometry();
                if (type === 'LineString') {
                    const length = calculateLength(geometry);
                    console.log('Length:', length);
                    setLength(length);
                } else if (type === 'Polygon') {
                    const areaValue = calculateArea(geometry);
                    console.log('Area:', areaValue);
                    setArea(areaValue);
                }
            });
        }
    };

    const calculateLength = (geometry) => {
        const length = getLength(geometry, { projection: map.getView().getProjection() });
        const lengthInMeters = Math.round(length * 100) / 100;  
        const lengthInKilometers = Math.round((length / 1000) * 100) / 100; / 
        return {
            meters: `${lengthInMeters} m`,
            kilometers: `${lengthInKilometers} km`
        };
    };

    const calculateArea = (geometry) => {
        if (geometry.getType() === 'Polygon') {
            const area = getArea(geometry, { projection: map.getView().getProjection() });
            const areaInSquareMeters = Math.round(area * 100) / 100;  
            const areaInSquareKilometers = Math.round((area / 1000000) * 100) / 100;  
            return {
                squareMeters: `${areaInSquareMeters} m²`,
                squareKilometers: `${areaInSquareKilometers} km²`
            };
        } else {
            return null; // Return null for non-polygon geometries
        }
    };

    return (
        <>
            <div id="map" style={{ width: '100%', height: '400px' }}></div>
            <div className='btns'>
                <button className='custom_select_btns' onClick={() => handleDrawType('Polygon')}>Draw Polygon</button>
                <button className='custom_select_btns' onClick={() => handleDrawType('LineString')}>Draw Line</button>
            </div>
            <div className='calculate_area'>
                {area ? (<p>Area in meters<sup>2</sup>:  {area.squareMeters} <br/> Area in km<sup>2</sup>:  {area.squareKilometers}</p>):<p>No polygon made yet</p>}
                {length ? (<p>Distance in meters:  {length.meters}<br/> Distance in km:  {length.kilometers}</p>) : <p>No lines Drawn yet</p> }
            </div>
        </>
    );
};

export default MapWithInteractions;
