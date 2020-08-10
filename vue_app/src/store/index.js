import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state:{
      Time: moment(), // moment object,
      timing_mode: null,
      bridges_with_params: [],
      map_layer: 0
    },
    mutations: {
      setBridges(state, array){
        state.bridges_with_params = array;
      },
      setTime(state, payload){
        state.Time = payload;
      },
      setTiming_mode(state, payload){
        state.timing_mode = payload;
      },
      setLayer(state, payload){
        state.map_layer = payload;
      }
    },
    strict: process.env.DEV
  })

  return Store
}
