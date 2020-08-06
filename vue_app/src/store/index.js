import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state:{
      Time: moment(), // moment object,
      bridges_with_params: []
    },
    mutations: {
      setBridges(state, array){
        state.bridges_with_params = array;
      },
      setTime(state, payload){
        state.Time = payload;
      }
    },
    strict: process.env.DEV
  })

  return Store
}
