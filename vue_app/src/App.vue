<template>
  <div id="q-app">
    <router-view/>
  </div>
</template>
<script>
    // import bridges_data from "bridges.json"
    export default {
        name: 'App',
        data(){
            return {
                bridges: [],
            }
        },
        created() {
            setInterval(this.getNow, 1000);

            this.$axios("/bridges.json").then((response) => {
                this.bridges = response.data.bridges;
                this.$store.commit("setBridges", this.bridges_with_params)
            })

        },
        computed:{
            app_language() {
                return this.$i18n.locale;
            },
            Time(){
                return this.$store.state.Time
            },
            bridges_with_params(){
                let new_bridges_features = this.bridges.map((bridge) => {
                    const checkTime_obj = this.checkTime(bridge.time);

                    let result_obj = Object.assign({}, bridge);

                    let bridge_description = bridge.time.map((time_obj) => {

                        let string_time = "";

                        if ( time_obj.hasOwnProperty("start") ){
                            string_time += time_obj.start;
                        }else{
                            return false;
                        }
                        if ( time_obj.hasOwnProperty("end") ) {
                            string_time += " - " + time_obj.end;
                        }


                        if (JSON.stringify(time_obj) === JSON.stringify(checkTime_obj.time_obj)) {
                            string_time = "<b>" + string_time + "</b>";
                        }
                        return string_time;
                    }).join("<br>")

                    if( bridge_description.length > 0){
                        bridge_description += "<br>";
                        bridge_description += "<br>";
                    }


                    // https://en.mostotrest-spb.ru//
                    var lang_prefix = this.app_language !== "ru" ? this.app_language + "." : "";
                    var link = "https://" + lang_prefix + "mostotrest-spb.ru/bridges/" + bridge.link;
                    var a_wrap_link = "<a href='" + link + "' target='_blank'>" + this.$t('mostotrest') + "</a>";
                    bridge_description += a_wrap_link;
                    result_obj.description = bridge_description


                    result_obj.comment = checkTime_obj.comment

                    var marker_color = this.checkTime_color(checkTime_obj)
                    result_obj.marker_color = marker_color

                    result_obj.status = checkTime_obj.status
                    result_obj.marker_symbol = [2, 3].includes(checkTime_obj.status) ? 'roadblock' : ''

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
                if (this.$store.state.timing_mode !== null) {
                    return moment(this.$store.state.timing_mode);
                }

                return moment(this.Time);
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
                var result = {
                    status: 0, // по умолчанию сведён
                    time_obj: {},
                    comment: ""
                };

                time_array.every((time_obj) => {
                    var obj = {
                        start: "",
                        end: ""
                    };

                    for (let [key, value] of Object.entries(time_obj)) {
                        // start: "1:45"

                        if( value.length > 10 ){
                            obj['start'] = value;
                            obj['end'] = value;
                            return false;
                        }

                        let regex = /([0-9]*):([0-9]*)/g;
                        let match = regex.exec(value);
                        let hour = match[1];
                        let minute = match[2];

                        obj[key] = this.getMomentNowTime().hour(parseInt(hour)).minute(parseInt(minute));

                    }

                    var start = obj.start;
                    var end = obj.end;

                    if (this.getMomentNowTime().isBetween(start, end, undefined, '[)')) {
                        // Разведён
                        result.status = 2;
                        result.time_obj = time_obj;
                        result.comment = this.$t('close');

                        var to_end = this.getMomentNowTime().diff(end, 'minutes');
                        if (to_end >= -20 && to_end <= 0) {
                            // Но скоро, а именно через 15 минут, сводится
                            result.status = 3;
                            result.time_obj = time_obj;
                            result.comment = this.$t('will_open', {minutes: Math.abs(to_end)});
                            return false;
                        }
                        return false;
                    } else {
                        // здесь проверка на  или скоро сведется 1 или 3

                        var to_start = this.getMomentNowTime().diff(start, 'minutes');
                        if (Math.abs(to_start) <= 20) {
                            // если до старта осталось 10 минут то скоро разводится
                            result.status = 1;
                            result.time_obj = time_obj;
                            result.comment = this.$t('will_close', {minutes: Math.abs(to_start)});
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
                // checkTime_obj {
                //     status, comment, time_obj
                //
                // statuses
                // 0 сведён
                // 1 скоро разведётся
                // 2 разведён
                // 3 скоро сведётся
                switch (checkTime_obj.status) {
                    case 0:
                        return "#57ff53";
                    case 1:
                        return "#cee705";
                    case 2:
                        return "#ff5b57";
                    case 3:
                        return "#feb01b";
                }
            },

            getYandexTime() {
                fetch("current_time.php")
                    .then(response => response.json())
                    .then(function (data) {
                        // console.log( "2" )
                        // Time = moment(data.time).utc().utcOffset(3);
                        setInterval(function () {
                            // var current_sec = Time.seconds();
                            // Time = Time.seconds(++current_sec);
                        }, 1000)
                    })
                    .catch(function (e) {

                    })
                    .finally(function () {
                        setInterval(() => {
                            var current_sec = getMomentNowTime().seconds();
                            var format_string = "";
                            if (current_sec % 2) {
                                format_string = "HH  mm";
                            } else {
                                format_string = "HH:mm";
                            }
                            var current_time = getMomentNowTime().utc().utcOffset(3).format(format_string);
                        }, 1000)
                    })
            },

            getNow() {
                const now = moment();
                this.$store.commit("setTime", now);
            }
        },
        watch: {
            bridges_with_params:{
                handler(newVal, oldVal){
                    if( JSON.stringify(newVal) !== JSON.stringify(oldVal) ){
                        this.$store.commit("setBridges", newVal)
                        console.warn("COMMIT TO VUEX")
                    }
                },
                deep:true
            }
        }
    }
</script>
