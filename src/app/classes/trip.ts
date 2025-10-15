import * as L from 'leaflet';
import { icon_names } from '../utils/utils';


export class Trip {
    locationLabel: string = "New York";
    centroid: L.LatLngExpression = [40.7306, -73.9652];
    lat: number = 0;
    long: number = 0;
    days: TripDay[] = [];
    activeDay: number = 0;
    map: L.Map | null = null;

    constructor(trip?: Trip, map?: L.Map) {
        if(trip) {
            this.activeDay = trip.activeDay || 0;
            this.locationLabel = trip.locationLabel;
            this.days = trip.days ?? [];      

            if (Array.isArray(trip.days)) {
                this.days = trip.days.map(day => new TripDay(day, map));
            }
        }

    }

    addDay(): void {
        const colorKeys = Object.keys(icon_names) as (keyof typeof icon_names)[];
        const usedColors = this.days.map(day => day.color);
        const nextColor = colorKeys.find(color => !usedColors.includes(color)) || colorKeys[0];

        this.days.push({label: `Day ${this.days.length + 1}`, markers: [], color: nextColor, polyline: null})
    }

    removeDay(index: number): void {
        const day = this.days[index];
        
        if (day.polyline && this.map) {
          this.map.removeLayer(day.polyline);
        }
        this.days.splice(index, 1);
        if (this.activeDay === index && index !== 0) this.setActiveDay(index - 1);
    }

    removeMarker(dayIndex: number, markIndex: number): void {
        this.days[dayIndex].markers?.splice(markIndex, 1);
    }

    updateMarkers(marker: L.Marker): void {
        if(this.days.length === 0) this.addDay(); 
        this.days[this.activeDay].markers?.push(this.createNextMarker(marker));

        console.log(this.days[this.activeDay])
        // this.updateDayPolyline(this.activeDay);
    }

    setActiveDay(index: number): void {
        this.activeDay = index;
    }

    createNextMarker(marker: L.Marker): TripMarker {
        return {
            markerObject: marker, 
            label: `Marker ${this.days[this.activeDay].markers!.length + 1}`, 
            order: 0, 
            description: ""
        }
    }

    initMap(): void {
        this.map = L.map('map', {
          center: this.centroid,
          zoom: 13
        });
    
        const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 20,
          minZoom: 5,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
    
        tiles.addTo(this.map);
      }

    clearAllDays(): void {
        this.days = [];
    }

    getDayColorIcon(setIcon: (color: keyof typeof icon_names) =>  L.Icon): any {
        const colorKeys = Object.keys(icon_names) as (keyof typeof icon_names)[];
        const dayColorKey = this.days.length ? this.days[this.activeDay].color : colorKeys[this.activeDay % colorKeys.length];
        return setIcon(dayColorKey);
    }

    updateMap(newMap: L.Map): void {
        this.clearAllDays()
        this.centroid = newMap.getCenter()
        this.map = newMap
    }

    toJSON(): any {
        return {
          locationLabel: this.locationLabel,
          centroid: this.centroid,
          activeDay: this.activeDay,
          days: this.days.map(day => ({
            label: day.label,
            color: day.color,
            markers: day.markers.map(marker => ({
              label: marker.label,
              order: marker.order,
              description: marker.description,
              markerObject: marker.markerObject instanceof L.Marker ? marker.markerObject.getLatLng() : null
            }))
          }))
        };
    }

    centerMap(): void {
        if (this.map && this.centroid) {
          this.map.setView(this.centroid, 13);
        }
    }
      
}

export class TripDay {
    label: string = "";
    markers: TripMarker[] = [];
    color: keyof typeof icon_names = 'blue';
    polyline: L.Polyline | null = null;
  
    constructor(day?: TripDay, map?: L.Map) {
      if (day) {
        this.label = day.label;
        this.color = day.color || 'blue';
        if (Array.isArray(day.markers)) {
          this.markers = day.markers.map(marker => new TripMarker(marker, map));
        }
      }
    }
  }

export class TripMarker {
    markerObject: L.Marker | null = null;
    label: string = "";
    order: number = 0;
    description: string = "";
  
    constructor(marker?: TripMarker, map?: L.Map) {
      if (marker) {
        if (marker.markerObject && !(marker.markerObject instanceof L.Marker)) {
          const { lat, lng } = marker.markerObject as { lat: number; lng: number };
          this.markerObject = L.marker([lat, lng]);
          if (map) this.markerObject.addTo(map);
        } else {
          this.markerObject = marker.markerObject;
        }
  
        this.label = marker.label;
        this.order = marker.order;
        this.description = marker.description;
      }
    }
  }