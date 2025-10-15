import { Component, ElementRef, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { CdkDragDrop, CdkDragEnd, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import * as GeoSearch from 'leaflet-geosearch';
import ResultList from 'leaflet-geosearch/dist/resultList';
import { Trip, TripMarker } from './classes/trip';
import { icon_names } from './utils/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  
})
export class AppComponent implements AfterViewInit {
  private map: L.Map | any = null;
  private centroid: L.LatLngExpression = [40.7306, -73.9652];
  trip: Trip = new Trip();
  searchResults: ResultList | null = null;
  searchText: string = "";
  searchInput = GeoSearch.GeoSearchControl({
    provider: new GeoSearch.OpenStreetMapProvider(),
  });
  private uploadedFile: JSON | string = "";
  markerInEdit: number | null = null;
  markerDay: number | null = null;
  dragOnly: boolean = false;

  private initMap(): void {
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
    this.map.addControl(this.searchInput);
  }

  constructor(private elementRef:ElementRef) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.trip.updateMap(this.map);
    this.map.addControl(this.searchInput);
    this.map.on('click',(event: L.LocationEvent) => {
      if(!this.dragOnly) {
        // const icon_option = this.trip.getDayColorIcon(this.setMarkerColor.bind(this));
        const icon = this.trip.getDayColorIcon(this.setMarkerColor.bind(this));
        const marker = L.marker(event.latlng, {draggable: true, icon})
        this.map.addLayer(marker)
        this.trip.updateMarkers(marker)
      }
    });
  }

  dragEnd(event: CdkDragEnd) {
    this.clickMap(event.dropPoint.x,event.dropPoint.y );
  }

  clickMap(x:number, y: number): void {
    let position = document.elementFromPoint(x,y);
    let event = new MouseEvent("click", { clientX: x, clientY: y, bubbles: true })
    position?.dispatchEvent(event);
  }

  removeDay(index: number): void {
    this.trip.days[index].markers!.forEach( (marker: TripMarker) => {
      this.map.removeLayer(marker.markerObject)
    })
    this.trip.removeDay(index);
  }

  searchMap(event: KeyboardEvent): void {
    this.searchInput.autoSearch(event);
    this.searchText.length ? this.searchResults = this.searchInput.resultList : this.searchResults = null;
  }

  selectSearch(selectedQuery: string): void {
    this.searchInput.searchElement.handleSubmit({query: selectedQuery})
    this.trip.updateMap(this.searchInput.map)
    this.setLocationLabel(selectedQuery);
    this.clearSearch()
  }

  clearSearch(): void {
    this.searchText = "";
    this.searchResults = null;
    this.searchInput.markers.remove()
  }

  setLocationLabel(label: string): void {
    let formattedString = label.split(",")[0];
    this.trip.locationLabel = formattedString;
  }

  removeMarker(marker: L.Marker | TripMarker | any, dayIndex: number, markIndex: number): void {
    if(this.map.hasLayer(marker)) {
      this.map.removeLayer(marker);
      this.trip.removeMarker(dayIndex, markIndex)
      // this.trip.updateDayPolyline(dayIndex);
    }
  }

  drop(event: CdkDragDrop<TripMarker[] | TripMarker[] | any>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  readFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files![0];
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = () => {
      const parsed = JSON.parse(reader.result as string);
      this.readTripFile(parsed);
    };
  }

  readTripFile(file: any): void {
    this.trip = new Trip(file, this.map);
    this.trip.map = this.map;
    this.trip.centerMap();
    console.log("Trip loaded:", this.trip);
  }

  editMarker(markerIndex: number, dayIndex: number): void {
    this.markerInEdit = markerIndex;
    this.markerDay = dayIndex;
  }

  resetEdit(): void {
    this.markerInEdit = null;
    this.markerDay = null;
  }

  shareTrip() {
    const dataStr = JSON.stringify(this.trip.toJSON(), null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.trip.locationLabel} - Trip.json`;
    a.click();

    URL.revokeObjectURL(url);
}

  setMarkerColor(color: keyof typeof icon_names): L.Icon {
    return new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/' + icon_names[color],
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  
  }
  
}  
