<template>
  <div id="q-app">
    <router-view/>
  </div>
</template>
<script>
    export default {
        name: 'App',
        data() {
            return {
                serverOffset: 0
            }
        },
        created() {
            const now = this.$moment();
            if (now.utcOffset() !== 180) {
                now.utcOffset(180)
            }
            this.$store.commit("setTime", now);
            this.getYandexTime()
            window.addEventListener('appinstalled', (evt) => {
                ym(66456622,'reachGoal','appinstalled');
            });
        },

        computed: {
            app_language() {
                return this.$i18n.locale;
            },
            Time() {
                return this.$store.state.Time
            }
        },
        methods: {
            getYandexTime() {

                let domain = "";
                if (process.env.DEV) {
                    domain = "http://localhost"
                }

                this.$axios(domain + "/server_bridges/current_time.php")
                    .then(response => {
                        const response_time = response.data.time;
                        const moment_obj_response_time = this.$moment(response_time);
                        this.serverOffset = moment_obj_response_time.diff(this.$moment());

                        if (response.data.hasOwnProperty("clocks")) {
                            if (response.data.clocks.hasOwnProperty("2")) {
                                this.$store.commit("setYandexClock", response.data.clocks["2"])
                            }
                        }

                    })
                    .catch(e => {
                        console.log(e)
                        ym(66456622,'reachGoal','error_time')
                    })
                    .finally(() => {
                        setInterval(this.getNow, 1000);
                    })
            },
            getNow() {
                const now = this.$moment();
                const now_with_offset = now
                    .add(this.serverOffset, 'milliseconds');

                if (now_with_offset.utcOffset() !== 180) {
                    now_with_offset.utcOffset(180)
                }

                this.$store.commit("setTime", now_with_offset);
            }
        }
    }
</script>
