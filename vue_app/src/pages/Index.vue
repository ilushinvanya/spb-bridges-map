<template>
  <q-page class="flex flex-center">


    <div id="map"></div>


    <SliderCard v-if="timing_mode"/>

  </q-page>
</template>

<script>
  import SliderCard from "../components/SliderCard";
    export default {
        name: 'Map',
        components: {SliderCard},
        data() {
            return {
                bridges_map_layer: ""
            }
        },
        computed: {
            timing_mode() {
                return this.$store.state.timing_mode
            },
            app_language() {
                return this.$i18n.locale;
            },
            Time() {
                return this.$store.state.Time
            },
            bridges_with_params() {
                return this.$store.state.bridges_with_params
            },
            generateFeatures() {
                var features = this.bridges_with_params.map((bridge) => {
                    var feature_bridge = {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: bridge.coordinates
                        },
                        properties: {
                            title: bridge.title[this.app_language],
                            description: bridge.description,

                            'marker-color': bridge.marker_color,
                            'marker-symbol': bridge.marker_symbol,

                            'marker-size': 'large'
                        }
                    };

                    return feature_bridge;
                });

                var geoJson = {
                    type: 'Bridges_Collection',
                    features: features
                };

                return geoJson;
            }
        },
        methods: {
            initMap() {
                L.mapbox.accessToken = 'pk.eyJ1IjoiaWx1c2hpbnZhbnlhIiwiYSI6ImNrZGVvcmhmbzI5M2UyeXM4bHFlYmpnZmwifQ.fZxiJyYQDS_CxhEXoZIueg';

                window.l_map = L.mapbox.map('map')
                    .setView([59.935446, 30.328063], 12)
                    .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11'));

                this.bridges_map_layer = L.mapbox
                    .featureLayer(this.generateFeatures)
                    .addTo(window.l_map);
            },
            setGeoJSON() {
                var geoJson = this.generateFeatures;
                this.bridges_map_layer.setGeoJSON(geoJson);
                //         layer.openPopup();
            }
        },
        mounted() {
            this.initMap()
        },
        watch: {
            generateFeatures: {
                handler(newVal, oldVal) {
                    this.setGeoJSON()
                },
                deep: true
            },
            slider_value(newVal) {
                this.$store.commit("setTiming_mode", newVal)
            }
        }
    }
</script>

<style lang="scss">
  #map {
    width: 100%;
    height: calc(100vh - 100px);
  }

  body.body--dark .leaflet-popup-content {
    background: var(--q-color-dark);
    color: #fff;
  }

  .marker-title {
    font-size: 20px;
    margin-bottom: 7px;
  }

  .marker-description {
    font-size: 16px;

    b {
      color: #792ec0;
    }
  }

  .slider_card {
    width: 100%;
    position: absolute;
    bottom: 0;
    z-index: 1001;
  }
</style>
