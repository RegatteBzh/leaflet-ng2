import {
    AfterContentInit,
    ContentChild,
    Directive,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Output,
} from '@angular/core';
import { GenericGeoJSONFeature } from '@yaga/generic-geojson';
import {
    Circle,
    CircleMarkerOptions,
    FillRule,
    LatLng,
    LatLngLiteral,
    LatLngTuple,
    LeafletEvent,
    LineCapShape,
    LineJoinShape,
    PathOptions,
    PopupEvent,
    TooltipEvent,
} from 'leaflet';
import { lng2lat } from './lng2lat';
import { MapComponent } from './map.component';

// Content-Child imports
import { PopupDirective } from './popup.directive';
import { TooltipDirective } from './tooltip.directive';

/**
 * Angular2 directive for Leaflet circles.
 *
 * *You can use this directive in an Angular2 template after importing `YagaModule`.*
 *
 * How to use in a template:
 * ```html
 * <yaga-map>
 *     <yaga-circle
 *         [(display)]="..."
 *         [(stroke)]="..."
 *         [(color)]="..."
 *         [(weight)]="..."
 *         [(opacity)]="..."
 *         [(lineCap)]="..."
 *         [(lineJoin)]="..."
 *         [(dashArray)]="..."
 *         [(dashOffset)]="..."
 *         [(fill)]="..."
 *         [(fillColor)]="..."
 *         [(fillOpacity)]="..."
 *         [(fillRule)]="..."
 *         [(className)]="..."
 *         [(style)]="..."
 *         [(position)]="..."
 *         [(lat)]="..."
 *         [(lng)]="..."
 *         [(radius)]="..."
 *         [(geoJSON)]="..."
 *
 *         (add)="..."
 *         (remove)="..."
 *         (popupopen)="..."
 *         (popupclose)="..."
 *         (tooltipopen)="..."
 *         (tooltipclose)="..."
 *         (click)="..."
 *         (dbclick)="..."
 *         (mousedown)="..."
 *         (mouseover)="..."
 *         (mouseout)="..."
 *         (contextmenu)="..."
 *
 *         [interactive]="..."
 *         [properties]="..."
 *         >
 *     </yaga-tile-layer>
 * </yaga-map>
 * ```
 *
 * @link http://leafletjs.com/reference-1.0.3.html#tilelayer Original Leaflet documentation
 * @link https://leaflet-ng2.yagajs.org/latest/browser-test?grep=Tile-Layer%20Directive Unit-Test
 * @link https://leaflet-ng2.yagajs.org/latest/coverage/lcov-report/lib/tile-layer.directive.js.html Test coverage
 * @link https://leaflet-ng2.yagajs.org/latest/typedoc/classes/tilelayerdirective.html API documentation
 * @example https://leaflet-ng2.yagajs.org/latest/examples/tile-layer-directive
 */
@Directive({
    selector: 'yaga-circle',
})
export class CircleDirective<T> extends Circle implements OnDestroy, AfterContentInit {
    @Output() public displayChange: EventEmitter<boolean> = new EventEmitter();
    @Output() public strokeChange: EventEmitter<boolean> = new EventEmitter();
    @Output() public colorChange: EventEmitter<string> = new EventEmitter();
    @Output() public weightChange: EventEmitter<number> = new EventEmitter();
    @Output() public opacityChange: EventEmitter<number> = new EventEmitter();
    @Output() public lineCapChange: EventEmitter<string> = new EventEmitter();
    @Output() public lineJoinChange: EventEmitter<string> = new EventEmitter();
    @Output() public dashArrayChange: EventEmitter<string> = new EventEmitter();
    @Output() public dashOffsetChange: EventEmitter<string> = new EventEmitter();
    @Output() public fillChange: EventEmitter<boolean> = new EventEmitter();
    @Output() public fillColorChange: EventEmitter<string> = new EventEmitter();
    @Output() public fillOpacityChange: EventEmitter<number> = new EventEmitter();
    @Output() public fillRuleChange: EventEmitter<string> = new EventEmitter();
    // @Output() public rendererChange: EventEmitter<number> = new EventEmitter();
    @Output() public classNameChange: EventEmitter<string> = new EventEmitter();
    @Output() public styleChange: EventEmitter<PathOptions> = new EventEmitter();

    @Output() public positionChange: EventEmitter<LatLng> = new EventEmitter();
    @Output() public latChange: EventEmitter<number> = new EventEmitter();
    @Output() public lngChange: EventEmitter<number> = new EventEmitter();
    @Output() public radiusChange: EventEmitter<number> = new EventEmitter();
    @Output() public geoJSONChange: EventEmitter<GenericGeoJSONFeature<GeoJSON.Point, T>> = new EventEmitter();

    /**
     * From leaflet fired add event.
     * Use it with `<yaga-circle (add)="processEvent($event)">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-add Original Leaflet documentation
     */
    @Output('add') public addEvent: EventEmitter<LeafletEvent> = new EventEmitter();
    /**
     * From leaflet fired remove event.
     * Use it with `<yaga-circle (remove)="processEvent($event)">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-remove Original Leaflet documentation
     */
    @Output('remove') public removeEvent: EventEmitter<LeafletEvent> = new EventEmitter();
    /**
     * From leaflet fired popupopen event.
     * Use it with `<yaga-circle (popupopen)="processEvent($event)">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-popupopen Original Leaflet documentation
     */
    @Output('popupopen') public popupopenEvent: EventEmitter<PopupEvent> = new EventEmitter();
    /**
     * From leaflet fired popupclose event.
     * Use it with `<yaga-circle (popupclose)="processEvent($event)">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-popupclose Original Leaflet documentation
     */
    @Output('popupclose') public popupcloseEvent: EventEmitter<PopupEvent> = new EventEmitter();
    /**
     * From leaflet fired tooltipopen event.
     * Use it with `<yaga-circle (tooltipopen)="processEvent($event)">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-tooltipopen Original Leaflet documentation
     */
    @Output('tooltipopen') public tooltipopenEvent: EventEmitter<TooltipEvent> = new EventEmitter();
    /**
     * From leaflet fired tooltipclose event.
     * Use it with `<yaga-circle (tooltipclose)="processEvent($event)">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-tooltipclose Original Leaflet documentation
     */
    @Output('tooltipclose') public tooltipcloseEvent: EventEmitter<TooltipEvent> = new EventEmitter();
    /**
     * From leaflet fired click event.
     * Use it with `<yaga-circle (click)="processEvent($event)">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-click Original Leaflet documentation
     */
    @Output('click') public clickEvent: EventEmitter<MouseEvent> = new EventEmitter();
    /**
     * From leaflet fired dbclick event.
     * Use it with `<yaga-circle (dbclick)="processEvent($event)">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-dbclick Original Leaflet documentation
     */
    @Output('dbclick') public dbclickEvent: EventEmitter<MouseEvent> = new EventEmitter();
    /**
     * From leaflet fired mousedown event.
     * Use it with `<yaga-circle (mousedown)="processEvent($event)">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-mousedown Original Leaflet documentation
     */
    @Output('mousedown') public mousedownEvent: EventEmitter<MouseEvent> = new EventEmitter();
    /**
     * From leaflet fired mouseover event.
     * Use it with `<yaga-circle (mouseover)="processEvent($event)">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-mouseover Original Leaflet documentation
     */
    @Output('mouseover') public mouseoverEvent: EventEmitter<MouseEvent> = new EventEmitter();
    /**
     * From leaflet fired mouseout event.
     * Use it with `<yaga-circle (mouseout)="processEvent($event)">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-mouseout Original Leaflet documentation
     */
    @Output('mouseout') public mouseoutEvent: EventEmitter<MouseEvent> = new EventEmitter();
    /**
     * From leaflet fired contextmenu event.
     * Use it with `<yaga-circle (contextmenu)="processEvent($event)">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-contextmenu Original Leaflet documentation
     */
    @Output('contextmenu') public contextmenuEvent: EventEmitter<MouseEvent> = new EventEmitter();

    /**
     * Imports a child popup directive if there is one defined
     */
    @Optional() @ContentChild(PopupDirective) public popupDirective: PopupDirective;
    /**
     * Imports a child tooltip directive if there is one defined
     */
    @Optional() @ContentChild(TooltipDirective) public tooltipDirective: TooltipDirective;

    private initialized: boolean = false;

    constructor(
        @Inject(forwardRef(() => MapComponent)) mapComponent: MapComponent,
    ) {
        super([0, 0]);

        this.feature = this.feature || {type: 'Feature', properties: {}, geometry: {type: 'Point', coordinates: []}};
        this.feature.properties = this.feature.properties || {};

        this.on('remove', () => {
            this.displayChange.emit(false);
        });
        this.on('add', () => {
            this.displayChange.emit(true);
        });

        mapComponent.addLayer(this);

        // Events
        this.on('add', (event: Event) => {
            this.addEvent.emit(event);
        });
        this.on('remove', (event: Event) => {
            this.removeEvent.emit(event);
        });
        this.on('popupopen', (event: PopupEvent) => {
            this.popupopenEvent.emit(event);
        });
        this.on('popupclose', (event: PopupEvent) => {
            this.popupcloseEvent.emit(event);
        });
        this.on('tooltipopen', (event: TooltipEvent) => {
            this.tooltipopenEvent.emit(event);
        });
        this.on('tooltipclose', (event: TooltipEvent) => {
            this.tooltipcloseEvent.emit(event);
        });
        this.on('click', (event: MouseEvent) => {
            this.clickEvent.emit(event);
        });
        this.on('dbclick', (event: MouseEvent) => {
            this.dbclickEvent.emit(event);
        });
        this.on('mousedown', (event: MouseEvent) => {
            this.mousedownEvent.emit(event);
        });
        this.on('mouseover', (event: MouseEvent) => {
            this.mouseoverEvent.emit(event);
        });
        this.on('mouseout', (event: MouseEvent) => {
            this.mouseoutEvent.emit(event);
        });
        this.on('contextmenu', (event: MouseEvent) => {
            this.contextmenuEvent.emit(event);
        });
    }

    /**
     * Internal method that provides the initialization of the child popup or tooltip
     */
    public ngAfterContentInit(): void {
        this.initialized = true;
        if (this.popupDirective) {
            this.bindPopup(this.popupDirective);
        }
        if (this.tooltipDirective) {
            this.bindTooltip(this.tooltipDirective);
        }
    }

    /**
     * Internal method to provide the removal of the layer in Leaflet, when removing it from the Angular template
     */
    public ngOnDestroy(): void {
        this.removeFrom((this as any)._map);
    }

    /**
     * Derived method of the original setLatLng.
     * @link http://leafletjs.com/reference-1.0.3.html#circle-setlatlng Original Leaflet documentation
     */
    public setLatLng(val: LatLng | LatLngTuple | LatLngLiteral): this {
        super.setLatLng((val as any));
        if (!this.initialized) {
            return this;
        }
        this.positionChange.emit((this as any)._latlng);
        this.latChange.emit((this as any)._latlng.lat);
        this.lngChange.emit((this as any)._latlng.lng);
        this.geoJSONChange.emit(this.geoJSON);
        return this;
    }
    @Input() public set position(val: LatLng | LatLngTuple | LatLngLiteral) {
        this.setLatLng(val);
    }
    public get position(): LatLng | LatLngTuple | LatLngLiteral { // it is always a LatLng!
        return (this as any)._latlng;
    }

    @Input() public set lat(val: number) {
        this.setLatLng([val, this.lng]);
    }
    public get lat(): number {
        return (this as any)._latlng.lat;
    }
    @Input() public set lng(val: number) {
        this.setLatLng([this.lat, val]);
    }
    public get lng(): number {
        return (this as any)._latlng.lng;
    }

    /**
     * Derived method of the original setRadius.
     * @link http://leafletjs.com/reference-1.0.3.html#circle-setradius Original Leaflet documentation
     */
    public setRadius(val: number): this {
        super.setRadius(val);
        this.radiusChange.emit(val);
        return this;
    }

    @Input() public set radius(val: number) {
        this.setRadius(val);
    }
    public get radius(): number {
        return this.getRadius();
    }

    /**
     * Two-Way bound property for the geoJSON data.
     * Use it with `<yaga-circle [(geoJSON)]="someValue">` or `<yaga-circle [geoJSONChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-opacity Original Leaflet documentation
     */
    @Input() public set geoJSON(val: GenericGeoJSONFeature<GeoJSON.Point, T>) {
        this.feature.properties = val.properties;

        const geomType: any = val.geometry.type; // Normally 'Point'

        /* istanbul ignore if */
        if (geomType !== 'Point') {
            throw new Error('Unsupported geometry type: ' + geomType );
        }
        this.setLatLng(lng2lat(val.geometry.coordinates) as any);
    }
    public get geoJSON(): GenericGeoJSONFeature<GeoJSON.Point, T> {
        return (this.toGeoJSON() as GenericGeoJSONFeature<GeoJSON.Point, T>);
    }
    /**
     * Derived method of the original setStyle.
     * @link http://leafletjs.com/reference-1.0.3.html#circle-setstyle Original Leaflet documentation
     */
    public setStyle(style: PathOptions): this {
        super.setStyle(style);
        if (style.hasOwnProperty('stroke')) {
            this.strokeChange.emit(style.stroke);
        }
        if (style.hasOwnProperty('color')) {
            this.colorChange.emit(style.color);
        }
        if (style.hasOwnProperty('weight')) {
            this.weightChange.emit(style.weight);
        }
        if (style.hasOwnProperty('opacity')) {
            this.opacityChange.emit(style.opacity);
        }
        if (style.hasOwnProperty('lineCap')) {
            this.lineCapChange.emit(style.lineCap);
        }
        if (style.hasOwnProperty('lineJoin')) {
            this.lineJoinChange.emit(style.lineJoin);
        }
        if (style.hasOwnProperty('dashArray')) {
            this.dashArrayChange.emit(style.dashArray);
        }
        if (style.hasOwnProperty('dashOffset')) {
            this.dashOffsetChange.emit(style.dashOffset);
        }
        if (style.hasOwnProperty('fill')) {
            this.fillChange.emit(style.fill);
        }
        if (style.hasOwnProperty('fillColor')) {
            this.fillColorChange.emit(style.fillColor);
        }
        if (style.hasOwnProperty('fillOpacity')) {
            this.fillOpacityChange.emit(style.fillOpacity);
        }
        if (style.hasOwnProperty('fillRule')) {
            this.fillRuleChange.emit(style.fillRule);
        }
        if (style.hasOwnProperty('className')) {
            this.classNameChange.emit(style.className);
        }
        this.styleChange.emit(style);

        return this;
    }
    /**
     * Two-Way bound property for the opacity.
     * Use it with `<yaga-circle [(opacity)]="someValue">` or `<yaga-circle [opacityChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-opacity Original Leaflet documentation
     */
    @Input() public set opacity(val: number) {
        this.setStyle({opacity: val});
    }
    public get opacity(): number {
        return this.options.opacity;
    }
    /**
     * Two-Way bound property for the stroke.
     * Use it with `<yaga-circle [(stroke)]="someValue">` or `<yaga-circle [strokeChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-stroke Original Leaflet documentation
     */
    @Input() public set stroke(val: boolean) {
        this.setStyle({stroke: val});
    }
    public get stroke(): boolean {
        return this.options.stroke;
    }
    /**
     * Two-Way bound property for the color.
     * Use it with `<yaga-circle [(color)]="someValue">` or `<yaga-circle [colorChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-color Original Leaflet documentation
     */
    @Input() public set color(val: string) {
        this.setStyle({color: val});
    }
    public get color(): string {
        return this.options.color;
    }
    /**
     * Two-Way bound property for the weight.
     * Use it with `<yaga-circle [(weight)]="someValue">` or `<yaga-circle [weightChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-weight Original Leaflet documentation
     */
    @Input() public set weight(val: number) {
        this.setStyle({weight: val});
    }
    public get weight(): number {
        return this.options.weight;
    }
    /**
     * Two-Way bound property for the lineCap.
     * Use it with `<yaga-circle [(lineCap)]="someValue">` or `<yaga-circle [lineCapChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-linecap Original Leaflet documentation
     */
    @Input() public set lineCap(val: LineCapShape) {
        this.setStyle({lineCap: val});
    }
    public get lineCap(): LineCapShape {
        return this.options.lineCap;
    }
    /**
     * Two-Way bound property for the lineJoin.
     * Use it with `<yaga-circle [(lineJoin)]="someValue">` or `<yaga-circle [lineJoinChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-linejoin Original Leaflet documentation
     */
    @Input() public set lineJoin(val: LineJoinShape) {
        this.setStyle({lineJoin: val});
    }
    public get lineJoin(): LineJoinShape {
        return this.options.lineJoin;
    }
    /**
     * Two-Way bound property for the dashArray.
     * Use it with `<yaga-circle [(dashArray)]="someValue">` or `<yaga-circle [dashArrayChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-dasharray Original Leaflet documentation
     */
    @Input() public set dashArray(val: string) {
        this.setStyle({dashArray: val});
    }
    public get dashArray(): string {
        return this.options.dashArray;
    }
    /**
     * Two-Way bound property for the dashOffset.
     * Use it with `<yaga-circle [(dashOffset)]="someValue">` or `<yaga-circle [dashOffsetChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-dashoffset Original Leaflet documentation
     */
    @Input() public set dashOffset(val: string) {
        this.setStyle({dashOffset: val});
    }
    public get dashOffset(): string {
        return this.options.dashOffset;
    }
    /**
     * Two-Way bound property for the fill.
     * Use it with `<yaga-circle [(fill)]="someValue">` or `<yaga-circle [fillChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-fill Original Leaflet documentation
     */
    @Input() public set fill(val: boolean) {
        this.setStyle({fill: val});
    }
    public get fill(): boolean {
        return this.options.fill;
    }
    /**
     * Two-Way bound property for the fillColor.
     * Use it with `<yaga-circle [(fillColor)]="someValue">` or `<yaga-circle [fillColorChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-fillcolor Original Leaflet documentation
     */
    @Input() public set fillColor(val: string) {
        this.setStyle({fillColor: val});
    }
    public get fillColor(): string {
        return this.options.fillColor;
    }
    /**
     * Two-Way bound property for the fillOpacity.
     * Use it with `<yaga-circle [(fillOpacity)]="someValue">` or `<yaga-circle [fillOpacityChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-fillopacity Original Leaflet documentation
     */
    @Input() public set fillOpacity(val: number) {
        this.setStyle({fillOpacity: val});
    }
    public get fillOpacity(): number {
        return this.options.fillOpacity;
    }
    /**
     * Two-Way bound property for the fillRule.
     * Use it with `<yaga-circle [(fillRule)]="someValue">` or `<yaga-circle [fillRuleChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-fillrule Original Leaflet documentation
     */
    @Input() public set fillRule(val: FillRule) {
        this.setStyle({fillRule: val});
    }
    public get fillRule(): FillRule {
        return this.options.fillRule;
    }
    /**
     * Two-Way bound property for the className.
     * Use it with `<yaga-circle [(className)]="someValue">` or `<yaga-circle [classNameChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-classname Original Leaflet documentation
     */
    @Input() public set className(val: string) {
        this.setStyle({className: val});
    }
    public get className(): string {
        return this.options.className;
    }
    /**
     * Two-Way bound property for the opacity.
     * Use it with `<yaga-circle [(style)]="someValue">` or `<yaga-circle [styleChange]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#circle-style Original Leaflet documentation
     */
    @Input() public set style(val: CircleMarkerOptions) {
        this.setStyle(val);
    }
    public get style(): CircleMarkerOptions {
        return this.options;
    }

    /**
     * Two-Way bound property for the display state.
     * Use it with `<yaga-circle [(display)]="someValue">` or `<yaga-circle [displayChange]="someValue">`
     */
    @Input() public set display(val: boolean) {
        const isDisplayed: boolean = this.display;
        if (isDisplayed === val) {
            return;
        }
        let container: HTMLElement;
        try {
            container = this.getElement() as HTMLElement;
        } catch (err) {
            /* istanbul ignore next */
            return;
        }
        this.displayChange.emit(val);
        container.style.display = val ? '' : 'none';
    }
    public get display(): boolean {
        let container: HTMLElement;
        try {
            container = this.getElement() as HTMLElement;
        } catch (err) {
            /* istanbul ignore next */
            return false;
        }
        return container.style.display !== 'none' && !!container.parentElement;
    }

    /**
     * Input for the GeoJSON properties.
     * Use it with `<yaga-circle [interactive]="someValue">`
     * @link http://leafletjs.com/reference-1.0.3.html#tilelayer-interactive Original Leaflet documentation
     */
    @Input() public set interactive(val: boolean) {
        const map: MapComponent = ((this as any)._map as MapComponent);
        this.options.interactive = val;
        this.onRemove(map);
        this.onAdd(map);
    }
    public get interactive(): boolean {
        return this.options.interactive;
    }

    /**
     * Input for the GeoJSON properties.
     * Use it with `<yaga-circle [properties]="someValue">`
     */
    @Input() public set properties(val: T) {
        this.feature.properties = val;
        this.geoJSONChange.emit(this.geoJSON);
    }
    public get properties(): T {
        return (this.feature.properties as T);
    }
}
