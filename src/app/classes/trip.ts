import * as L from 'leaflet';

export class Trip {
    locationLabel: string = "New York";
    centroid: L.LatLngExpression = [40.7306, -73.9652];
    lat: number = 0;
    long: number = 0;
    days: TripDay[] = [];
    activeDay: number = 0;
    map: L.Map | null = null;

    constructor(trip?: Trip) {
        if(trip) {
            this.activeDay = trip.activeDay | 0;
            this.locationLabel = trip.locationLabel;
            this.lat = trip.lat;
            this.long = trip.long;
            this.centroid = [this.lat, this.long];
            if(Array.isArray(trip.days) && trip.days.length) {
                trip.days.forEach((day: TripDay) => {
                    this.days.push(new TripDay(day))
                })
            }        
        }
    }

    addDay(): void {
        this.days.push({label: `Day ${this.days.length + 1}`, markers: []})
    }

    removeDay(index: number): void {
        this.days.splice(index, 1)
        if(this.activeDay === index && index !== 0) this.setActiveDay(index - 1)
    }

    removeMarker(dayIndex: number, markIndex: number): void {
        this.days[dayIndex].markers?.splice(markIndex, 1);
    }

    updateMarkers(marker: L.Marker): void {
        if(this.days.length === 0) this.addDay(); 
        this.days[this.activeDay].markers?.push(this.createNextMarker(marker));
    }

    setActiveDay(index: number): void {
        this.activeDay = index;
    }

    createNextMarker(marker: L.Marker): TripMarker {
        return {markerObject: marker, label: `Marker ${this.days[this.activeDay].markers!.length + 1}`, order: 0, description: ""}
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
}

export class TripDay {
    label: string = "";
    markers: TripMarker[] = []

    constructor(day?: TripDay) {
        if(day) {
            this.label = day.label;
            if(Array.isArray(day.markers) && day.markers.length) {
                day.markers.forEach((marker: TripMarker) => {
                    this.markers.push(new TripMarker(marker))
                })
            }        
        }
    }
}  

export class TripMarker {
    markerObject: L.Marker | null = null;
    label: string = "";
    order: number = 0;
    // lat: number = 0;
    // long: number = 0;
    description: string = "";

    constructor(marker?: TripMarker) {
        if(marker) {
            this.markerObject = marker.markerObject;
            this.label = marker.label;
            this.order = marker.order;
            this.description = marker.description;
        }
    }

    
}