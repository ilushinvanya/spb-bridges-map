<template>
  <div id="map" :style="{minHeight: min_height}"></div>
</template>

<script>
    import mapboxgl from 'mapbox-gl';

    export default {
        name: 'Map',
        props: ['min_height'],
        data() {
            return {
                source_bridges: [],
                mapbox_access_token: 'pk.eyJ1IjoiaWx1c2hpbnZhbnlhIiwiYSI6ImNrZGVvcmhmbzI5M2UyeXM4bHFlYmpnZmwifQ.fZxiJyYQDS_CxhEXoZIueg',
                url_webcam: "https://www.youtube.com/embed/ATyR49Y4IEk"
            }
        },
        computed: {
            dark_mode() {
                return this.$store.state.dark_mode;
            },
            map_styles(){
                let styles;
                if ( this.dark_mode ){
                    styles = 'mapbox://styles/mapbox/dark-v10';
                }else{
                    styles = 'mapbox://styles/mapbox/streets-v11';
                }
                return styles;
            },
            gl_support: {
                get() {
                    return this.$store.state.gl_support;
                },
                set(val) {
                    this.$store.commit('setGLSupport', val)
                }
            },
            Features() {
                return this.$store.state.geoJson_features
            },
            timing_mode() {
                return this.$store.state.timing_mode
            },
            app_language() {
                return this.$i18n.locale;
            },
            Time() {
                return this.$store.state.Time
            }
        },
        methods: {
            // Инициация карты
            checkSupportGLBrowser() {
                mapboxgl.accessToken = this.mapbox_access_token;
                if (!mapboxgl.supported()) {
                    this.initMapboxJSMap();
                    this.gl_support = false;
                    console.log('Your browser does not support Mapbox GL');
                    ym(66456622, 'reachGoal', 'gl_not_supported')
                } else {
                    this.gl_support = true;
                    this.initMapboxGLMap();
                }
                this.$q.dark.set(this.dark_mode)
            },
            initMapboxJSMap() {
                L.mapbox.accessToken = this.mapbox_access_token;

                window.map = L.mapbox.map('map')
                    .setView([59.935446, 30.328063], 12)
                    .addLayer(L.mapbox.styleLayer(this.map_styles));

                window.bridges_map_layer = L.mapbox
                    .featureLayer()
                    .addTo(window.map);
                this.setGeoJSON()
            },
            initMapboxGLMap() {

                const self = this;

                window.map = new mapboxgl.Map({
                    container: 'map',
                    style: self.map_styles,
                    center: [30.374144114706155, 59.90882829669761],
                    zoom: 11,
                    pitch: 45,
                    bearing: -17.6,
                    antialias: true
                });


                const geoJson = this.Features;

                window.map.on('load', function () {

                    map.loadImage('/map_icons/car.png', function (error, image) {
                        if (error) throw error;
                        map.addImage('car', image);
                    });

                    map.loadImage('/map_icons/boat.png', function (error, image) {
                        if (error) throw error;
                        map.addImage('boat', image);
                    });

                    map.loadImage('/map_icons/cinema.png', function (error, image) {
                        if (error) throw error;
                        map.addImage('cinema', image);
                    });

                    window.map.addSource('points', {
                        'type': 'geojson',
                        'data': geoJson
                    });

                    window.map.addLayer({
                        'id': 'circles',
                        'type': 'circle',
                        'source': 'points',
                        'paint': {
                            'circle-stroke-color': ['get', 'custom_active_color'],
                            'circle-stroke-width': ['get', 'custom_active_stroke_size'],
                            'circle-color': ['get', 'marker-color'],
                            'circle-radius': 16
                        }
                    });

                    window.map.addLayer({
                        'id': 'symbols',
                        'type': 'symbol',
                        'source': 'points',
                        'layout': {
                            'icon-image': ['get', 'marker-symbol'],
                            'text-field': [
                                'format',
                                ['upcase', ['get', 'title']],
                                {'font-scale': 0.8},
                                '\n',
                                {},
                                ['downcase', ['get', 'custom_comment']],
                                {'font-scale': 0.6}
                            ],
                            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                            'text-offset': [0, 0.8],
                            'text-anchor': 'top'
                        },
                        paint: {
                            "text-color": self.dark_mode ? "#fff" : "#000"
                        }
                    });

                    map.on('click', 'circles', function (e) {
                        self.$store.commit("setOpen_bridge", e.features[0].id)
                    });


                })
            },

            // Размещение маркеров на карту
            setGeoJSON() {
                const geoJson = this.Features;
                const camera_string = this.$t('camera');
                const url_webcam = this.url_webcam;
                window.bridges_map_layer.setGeoJSON(geoJson);

                window.bridges_map_layer.eachLayer(function (layer) {
                    if (layer.feature.properties.title === camera_string) {
                        var content = '<iframe width="280" height="200" src="' + url_webcam + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
                        layer.bindPopup(content);
                    }
                });
            },
            setMarkerData() {
                const geoJson = this.Features;
				        if(!map.getSource('points')) return;
                map.getSource('points').setData(
                    geoJson
                );

            },

        },
        watch: {
            dark_mode(){
                this.checkSupportGLBrowser()
            },
            Features: {
                handler() {
                    if (this.gl_support === true) {
                        this.setMarkerData()
                    } else if (this.gl_support === false) {
                        this.setGeoJSON()
                    }
                },
                deep: true
            }
        }
    }
</script>

<style lang="scss">
  body.mobile {
    .mapboxgl-popup {
      bottom: 50px;
      top: auto;
      left: 50%;
      transform: translateX(-50%) !important;

      .mapboxgl-popup-tip {
        display: none;
      }
    }
  }

  #map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;

    h6 {
      margin: 0;
    }
  }

  body.body--dark {
    .leaflet-popup-content {
      background: var(--q-color-dark);
      color: #fff;
    }

    .mapboxgl-popup {
      .q-card {
        background: #78909c;
        color: white;
      }
    }
  }

  .marker-title {
    font-size: 20px;
  }

  .marker-description {
    font-size: 16px;

    .bridge_comment {
      color: #a7a7a7;
      font-size: 14px;
      margin-bottom: 10px;
    }

    b {
      color: #792ec0;
    }
  }


  .mapboxgl-popup {
    position: absolute;
    min-width: 300px;
    font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;


    .mapboxgl-popup-content {
      background: transparent;
      border-radius: 0;
      box-shadow: none;
      padding: 0;
      width: 100%;

      .q-card {
        width: 100%;
      }
    }

    .mapboxgl-popup-close-button {
      right: 6px;
      top: 13px;
      z-index: 99;
      font-size: 40px;
    }

    iframe {
      width: 100%;
    }
  }
</style>
