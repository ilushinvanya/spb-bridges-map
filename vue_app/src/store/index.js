import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const dark_local = localStorage.getItem("dark");

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state: {
      gl_support: null,
      Time: 0, // moment object,
      timing_mode: null,
      yandex_clock: {},
      open_bridge_id: 0,
      bridges_with_params: [],
      geoJson_features: {},
      dark_mode: dark_local ? !!dark_local : false,
      parse_time: null,
    },
    mutations: {
      setDarkMode(state, bool){
        state.dark_mode = bool;
      },
      setFeatures(state, obj){
        state.geoJson_features = obj;
      },
      setOpen_bridge(state, id){
        state.open_bridge_id = id;
      },
      setGLSupport(state, bool){
        state.gl_support = bool;
      },
      setBridges(state, array){
        state.bridges_with_params = array;
      },
      setTime(state, payload){
        state.Time = payload;
      },
      setTiming_mode(state, payload){
        state.timing_mode = payload;
      },
      setYandexClock(state, payload){
        state.yandex_clock = payload;
      },
      setParseTime(state, time_string){
        state.parse_time = time_string;
      }
    },
    strict: process.env.DEV
  })

  return Store
}
