/**
 * The custom USGSOverlay object contains the USGS image,
 * the bounds of the image, and a reference to the map.
 */
export class USGSOverlay extends google.maps.OverlayView {
    private bounds: google.maps.LatLngBounds;
    private image: string;
    private div?: HTMLElement;

    constructor(bounds: google.maps.LatLngBounds, image: string) {
        super();

        this.bounds = bounds;
        this.image = image;
    }


    /**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
    onAdd() {
        this.div = document.createElement("div");
        this.div.style.borderStyle = "none";
        this.div.style.borderWidth = "0px";
        this.div.style.position = "absolute";

        // Create the img element and attach it to the div.
        const img = document.createElement("img");

        img.src = this.image;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.position = "absolute";
        this.div.appendChild(img);

        // Add the element to the "overlayLayer" pane.
        const panes = this.getPanes()!;

        panes.overlayLayer.appendChild(this.div);
    }


}

