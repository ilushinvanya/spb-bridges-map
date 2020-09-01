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
                bridges: [],
                serverOffset: 0,
            }
        },
        created() {
            const now = this.$moment();
            if (now.utcOffset() !== 180) {
                now.utcOffset(180)
            }
            this.$store.commit("setTime", now);


            this.getYandexTime()

            this.getBridges()

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
            },
            bridges_with_params() {
                let new_bridges_features = this.bridges.map((bridge) => {
                    const checkTime_obj = this.checkTime(bridge.time);

                    let result_obj = Object.assign({}, bridge);

                    let bridge_description = bridge.time.map((time_obj) => {

                        let string_time = "";

                        if (time_obj.hasOwnProperty("start")) {
                            if ( time_obj.start == 0 ){
                                string_time = this.$t("not_closed")
                            }else{
                                string_time += time_obj.start;
                            }
                        } else {
                            return false;
                        }
                        if (time_obj.hasOwnProperty("end")) {
                            string_time += " - " + time_obj.end;
                        }


                        if (JSON.stringify(time_obj) === JSON.stringify(checkTime_obj.time_obj)) {
                            string_time = "<b>" + string_time + "</b>";
                        }
                        return string_time;
                    }).join("<br>")

                    result_obj.list_description = bridge_description;

                    if (bridge_description.length > 0) {
                        bridge_description += "<br>";
                        bridge_description += "<br>";
                    }


                    // https://en.mostotrest-spb.ru//
                    let lang_prefix = this.app_language !== "ru" ? this.app_language + "." : "";
                    let link = "https://" + lang_prefix + "mostotrest-spb.ru/bridges/" + bridge.link;
                    let a_wrap_link = "<a href='" + link + "' target='_blank'>" + this.$t('mostotrest') + "</a>";
                    bridge_description += a_wrap_link;
                    result_obj.description = bridge_description;




                    result_obj.comment = checkTime_obj.comment

                    const marker_color = this.checkTime_color(checkTime_obj)
                    result_obj.marker_color = marker_color

                    result_obj.status = checkTime_obj.status;

                    let marker_symbol = "";
                    if ([2, 3].includes(checkTime_obj.status)){
                        marker_symbol = 'ferry';
                    }else if(bridge.time[0].start == 0){
                        marker_symbol = 'car';
                    }else{
                        marker_symbol = 'car';

                    }
                    result_obj.marker_symbol =  marker_symbol;

                    return result_obj;
                })
                return new_bridges_features;
                //     "title": {
                //         "ru": "Дворцовый",
                //         "en": "Palace Bridge",
                //         "ch": "宫廷桥"
                //     "time": [
                //         "start": "3:10",
                //         "end": "4:55"
                //     "link": "dvorczovyj",
                //     "coordinates": [30.308306,59.941057]

                //    bridge_description
                //    comment
                //    marker-color
                //    marker-symbol
                //    status
            }
        },
        methods: {
            getMomentNowTime() {

                // Эта проверка для тайминг режима
                if (this.$store.state.timing_mode !== null) {
                    return this.$moment(this.$store.state.timing_mode);
                }

                return this.$moment(this.Time);
            },
            checkTime(time_array) {

                // 0 сведён
                // 1 скоро разведётся
                // 2 разведён
                // 3 скоро сведётся

                // time_array: [
                //     {
                //         start: "1:25",
                //         end: "2:45"
                //     },
                //     {
                //         start: "3:10",
                //         end: "5:00"
                //     }
                // ]
                let result = {
                    status: 0, // по умолчанию сведён
                    time_obj: {},
                    comment: this.$t('open')
                };

                time_array.every((time_obj) => {
                    let obj = {
                        start: "",
                        end: ""
                    };

                    for (let [key, value] of Object.entries(time_obj)) {
                        // start: "1:45"

                        if (value == 0) {
                            obj['start'] = 0;
                            return false;
                        }

                        let regex = /([0-9]*):([0-9]*)/g;
                        let match = regex.exec(value);
                        let hour = match[1];
                        let minute = match[2];

                        obj[key] = this.getMomentNowTime().hour(parseInt(hour)).minute(parseInt(minute));

                    }

                    let start = obj.start;
                    let end = obj.end;

                    if (this.getMomentNowTime().isBetween(start, end, undefined, '[)')) {
                        // Разведён
                        result.status = 2;
                        result.time_obj = time_obj;
                        result.comment = this.$t('close');

                        let to_end = this.getMomentNowTime().diff(end, 'minutes');
                        if (to_end >= -20 && to_end <= 0) {
                            // Но скоро, а именно через 15 минут, сводится
                            result.status = 3;
                            result.time_obj = time_obj;
                            result.comment = this.$t('will_open_min', {minutes: Math.abs(to_end)});
                            return false;
                        }
                        return false;
                    } else {
                        // здесь проверка на или скоро сведется 1 или 3

                        let to_start = this.getMomentNowTime().diff(start, 'minutes');
                        if (Math.abs(to_start) <= 20) {
                            // если до старта осталось 10 минут то скоро разводится
                            result.status = 1;
                            result.time_obj = time_obj;
                            result.comment = this.$t('will_close_min', {minutes: Math.abs(to_start)});
                            return false;
                        } else {
                            // result = 0
                            return true;
                        }
                    }

                });

                return result;

            },

            checkTime_color(checkTime_obj) {
                let R = 75;
                let G = 255;
                const B = 80;
                const green_start_color = "rgb(75, 255, 80)";

                // checkTime_obj {
                //     status, comment, time_obj
                //
                // statuses
                // 0 сведён
                // 180 разница у красного и зеленого
                // 1 скоро разведётся
                // 2 разведён
                // 3 скоро сведётся


                let result_color_string = "";
                let minutes = 0;
                if ( checkTime_obj.comment.length > 0 ){
                    const array_of_number = checkTime_obj.comment.match(/[0-99*]/g);
                    if( array_of_number !== null){
                      const string_minutes = array_of_number.join("");
                      minutes = parseInt(string_minutes);

                    }
                }

                switch (checkTime_obj.status) {
                    case 0:
                        const green_HEX_color = this.rgbToHex(R, G, B);
                        return green_HEX_color;
                    case 1:

                        // от 20 до 11 минут, самое начало
                        if ( minutes > 10 ){

                            // увеличиваем Красный до максимума
                            let new_R = R + 19 * (20 - minutes);
                            if(new_R > 255) new_R = 255;

                            // Красный стремится к макс, зеленый на максимуме
                            result_color_string = this.rgbToHex(new_R, G, B);
                        }else{
                            // от 10 до 0 минут

                            // уменьшаем Зеленый до 91
                            let new_G = G - 15 * (10 - minutes);
                            if ( new_G < 91 ) new_G = 91;

                            // в итоге макс Красный, минимальный Зеленый 91
                            result_color_string = this.rgbToHex(255, new_G, B);
                        }

                        return result_color_string;

                    case 2:
                        return "#ff5b50";
                    case 3:

                        // от 20 до 11 минут
                        if ( minutes > 10 ){

                            // Выкручиваем Зеленый на максимум
                            let new_G = 91 + 15 * (20 - minutes);
                            if(new_G > 255) new_G = 255;

                            // 255 Красного, 255 Зеленого
                            result_color_string = this.rgbToHex(255, new_G, B);
                        }else{

                            // Уменьшаем Красный до 75
                            let new_R = 255 - 19 * (10 - minutes);
                            if ( new_R > 255 ) new_R = 255;

                            result_color_string = this.rgbToHex(new_R, G, B);
                        }

                        return result_color_string;


                        // return "#feb01b";
                }
            },
            rgbToHex(r, g, b) {
                return '#' + [r, g, b].map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex
                }).join('')
            },


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

            getBridges() {
                const local_bridges = localStorage.getItem("bridges");
                if (local_bridges) {
                    this.bridges = JSON.parse(local_bridges);
                }
                this.$axios("http://localhost/server_bridges/get_bridges.php")
                    .then((response) => {
                        if (typeof response.data === 'object') {
                            if (response.data.hasOwnProperty("bridges")) {
                                this.bridges = response.data.bridges;

                                const stringify_bridges_response = JSON.stringify(response.data.bridges);

                                if (local_bridges) {
                                    if ( stringify_bridges_response === local_bridges){
                                        // изменений нет
                                    }else{
                                        // Есть изменения после последнего получения bridges
                                    }
                                }


                                localStorage.setItem("bridges", stringify_bridges_response);
                            }
                        }
                    })
                    .catch(e => {


                    })
                    .finally(() => {
                        this.$store.commit("setBridges", this.bridges_with_params)
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
        },
        watch: {
            bridges_with_params: {
                handler(newVal, oldVal) {
                    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
                        this.$store.commit("setBridges", newVal)
                        // console.warn("COMMIT TO VUEX")
                    }
                },
                deep: true
            }
        }
    }
</script>
