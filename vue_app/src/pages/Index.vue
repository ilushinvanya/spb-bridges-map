<template>
  <q-page class="flex flex-center overflow-hidden">

    <div id="legenda"
         :class="transition_class"
         v-touch-swipe.mouse="handleSwipe">

      <q-btn
        flat
        round
        icon="close"
        class="absolute-top-right z-max"
        @click="handleSwipe({direction:'up'})"
      />

      <q-card>
        <q-card-section>
          <q-list>

            <q-item>
              <q-item-section avatar>
                <img src="../assets/pin_ferry.png"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ $t('close') }}</q-item-label>
                <q-item-label caption>{{ $t('will_open') }}</q-item-label>
              </q-item-section>
            </q-item>


            <q-item>
              <q-item-section avatar>
                <img src="../assets/pin_car.png"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ $t('open') }}</q-item-label>
                <q-item-label caption>{{ $t('will_close') }}</q-item-label>
              </q-item-section>
            </q-item>


          </q-list>
        </q-card-section>
      </q-card>
    </div>


    <div id="map"></div>


    <SliderCard v-if="timing_mode"/>

  </q-page>
</template>

<script>
    import {
        QCard
    } from 'quasar'



    import mapboxgl from 'mapbox-gl';
    import SliderCard from "../components/SliderCard";

    export default {
        name: 'Map',
        components: {SliderCard},
        data() {
            return {
                mapbox_access_token: 'pk.eyJ1IjoiaWx1c2hpbnZhbnlhIiwiYSI6ImNrZGVvcmhmbzI5M2UyeXM4bHFlYmpnZmwifQ.fZxiJyYQDS_CxhEXoZIueg',
                transition_class: "up",
                url_webcam: "https://www.youtube.com/embed/ATyR49Y4IEk"
            }
        },
        computed: {
            gl_support: {
                get() {
                    return this.$store.state.gl_support;
                },
                set(val) {
                    this.$store.commit('setGLSupport', val)
                }
            },
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
                const features = this.bridges_with_params.map((bridge) => {

                    const poster_image = (bridge.status === 0 || bridge.status === 1) ? bridge.images.open : bridge.images.close;

                    let custom_status = {
                        color: "",
                        text: ""
                    };
                    if (bridge.status === 0) {
                        custom_status.color = "bg-light-green";
                        custom_status.text = "&nbsp;";
                    } else if (bridge.status === 1) {
                        custom_status.color = "bg-light-green";
                        custom_status.text = this.$t("open");
                    } else if (bridge.status === 2) {
                        custom_status.color = "bg-red";
                        custom_status.text = "&nbsp;";
                    } else if (bridge.status === 3) {
                        custom_status.color = "bg-red";
                        custom_status.text = this.$t("close");
                    }


                    const feature_bridge = {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: bridge.coordinates
                        },
                        properties: {
                            custom_status: custom_status,

                            poster_image: poster_image,
                            custom_comment: bridge.comment,
                            custom_time_html: bridge.time_html,
                            custom_url: bridge.url,

                            title: bridge.title[this.app_language],
                            description: "<div class='bridge_comment'>" + bridge.comment + "</div><div>" + bridge.description + "</div>",

                            'marker-color': bridge.marker_color,
                            'marker-symbol': bridge.marker_symbol,

                            'marker-size': 'large'
                        }
                    };

                    return feature_bridge;
                });

                features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [30.304522, 59.937630],
                    },
                    properties: {
                        custom_comment: "camera",
                        custom_time_html: "",
                        custom_url: "",

                        title: this.$t('camera'),
                        description: '<iframe width="380" height="215" src="' + this.url_webcam + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
                        'marker-color': '#444eff',
                        'marker-symbol': 'cinema',
                        'marker-size': 'small'
                    }
                })


                var geoJson = {
                    type: 'Bridges_Collection',
                    features: features
                };

                return geoJson;
            }
        },
        methods: {
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
            },
            initMapboxJSMap() {
                L.mapbox.accessToken = this.mapbox_access_token;

                window.map = L.mapbox.map('map')
                    .setView([59.935446, 30.328063], 12)
                    .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11'));

                window.bridges_map_layer = L.mapbox
                    .featureLayer()
                    .addTo(window.map);
                this.setGeoJSON()
            },
            initMapboxGLMap() {
                window.map = new mapboxgl.Map({
                    container: 'map',
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [30.374144114706155, 59.90882829669761],
                    zoom: 11,
                    pitch: 45,
                    bearing: -17.6,
                    antialias: true
                });


                const geoJson = this.generateFeatures;
                window.bridges_map_layer = geoJson.features.map((feature_marker) => {

                    const popup = new mapboxgl.Popup({offset: 0});

                    const marker = new mapboxgl.Marker({
                        color: feature_marker.properties['marker-color']
                    })
                        .setLngLat(feature_marker.geometry.coordinates)
                        .setPopup(popup)
                        .addTo(window.map);

                    return marker;
                });


                this.setMarkerData()


            },
            setGeoJSON() {
                const geoJson = this.generateFeatures;
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

                // const ren = new QCard({ tag: "div" }).$options.render(createElement){ return createElement }


                // console.log(ren)



                // console.log(  )
                // console.log(this.render("<q-card/>"))

                const geoJson = this.generateFeatures;
                window.bridges_map_layer.forEach((marker) => {

                    geoJson.features.forEach((new_feature_marker) => {

                        const marker_lng = marker.getLngLat().lng;
                        const new_feature_lng = new_feature_marker.geometry.coordinates[0];

                        if (marker_lng === new_feature_lng) {

                            const $elem = marker.getElement();
                            const color = new_feature_marker.properties['marker-color'];
                            const g = $elem.querySelectorAll('svg g[fill="' + marker._color + '"]')[0];
                            g.setAttribute('fill', color);
                            marker._color = color;

                            let popup;
                            // Для камеры
                            if (new_feature_marker.properties.custom_comment === "camera") {




                                popup = new mapboxgl.Popup({offset: 0})
                                    .setHTML(
                                        // new QCard({
                                        //     tag: "div"
                                        // })
                                        `<div class="q-card">
                                            <div class="q-video">${new_feature_marker.properties.description}</div>
                                             <div class="q-card__section q-card__section--vert">
                                                <div class="text-h6">${new_feature_marker.properties.title}</div>
                                            </div>
                                        </div>`
                                    );

                            } else {
                                const times_html = new_feature_marker.properties.custom_time_html.split("<br>").map(time_string => {

                                    const icon_had = time_string.includes("<b>") ? "text-red" : "";

                                    return `<div class="q-chip row inline no-wrap items-center ${icon_had} q-chip--colored q-chip--outline q-chip--square">
                                        <i aria-hidden="true" role="presentation" class="q-chip__icon q-chip__icon--left material-icons q-icon notranslate">schedule</i>
                                        <div class="q-chip__content col row no-wrap items-center q-anchor--skip">
                                            <div class="ellipsis">${time_string}</div>
                                        </div>
                                     </div>`

                                }).join("");

                                popup = new mapboxgl.Popup({offset: 0})
                                    .setHTML(
                                        `<div class="q-card">
                                         <img src="${new_feature_marker.properties.poster_image}">

                                         <div class="q-card__section q-card__section--vert">
                                             <div class="text-h6">${new_feature_marker.properties.title}
                                                <div role="alert" class="q-badge flex inline items-center no-wrap q-badge--single-line ${new_feature_marker.properties.custom_status.color}" style="vertical-align: top;">${new_feature_marker.properties.custom_status.text}</div>
                                             </div>
                                             <div class="text-subtitle2">${new_feature_marker.properties.custom_comment}</div>
                                         </div>

                                         <hr role="separator" class="q-separator q-separator q-separator--horizontal"/>

                                         <div class="q-card__section q-card__section--vert">
                                             <div style="margin-left: -4px;">${times_html}</div>
                                        </div>


                                         <hr role="separator" class="q-separator q-separator q-separator--horizontal"/>

                                         <div class="q-card__section q-card__section--vert">

                                             <a tabindex="0" type="button" target="_blank" href="${new_feature_marker.properties.custom_url}" role="link" class="q-btn q-btn-item non-selectable no-outline q-btn--rectangle text-purple q-btn--actionable q-focusable q-hoverable q-btn--no-uppercase q-btn--wrap">
                                                <span class="q-focus-helper"></span>
                                                <span class="q-btn__wrapper col row q-anchor--skip">
                                                    <span class="q-btn__content text-center col items-center q-anchor--skip justify-center row">
                                                        <i aria-hidden="true" role="img" class="material-icons q-icon notranslate">link</i>
                                                        ${this.$t("mostotrest")}
                                                    </span>
                                                </span>
                                             </a>

                                          </div>
                                       </div>`
                                    );
                            }


                            marker.setPopup(popup)
                        }
                    })
                });
            },

            handleSwipe(e) {
                this.transition_class = e.direction;
                ym(66456622, 'reachGoal', 'hide_legend')
            }
        },
        mounted() {
            this.checkSupportGLBrowser()
        },
        watch: {
            generateFeatures: {
                handler(newVal, oldVal) {
                    if (this.gl_support) {
                        this.setMarkerData()
                    } else {
                        this.setGeoJSON()
                    }
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
  #legenda {

    width: 300px;
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 999;
    transition: all .4s ease;

    &.left {
      right: 100%
    }

    &.right {
      right: -300px
    }

    &.up {
      top: -1000px
    }

    &.down {
      top: 100%
    }

    & * {
      user-select: none;
    }
  }

  #map {
    width: 100%;
    height: calc(100vh - 100px);
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

  .slider_card {
    width: 100%;
    position: absolute;
    bottom: 0;
    z-index: 1001;
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
