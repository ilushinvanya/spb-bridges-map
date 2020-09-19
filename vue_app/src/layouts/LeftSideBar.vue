<template>
  <div class="aside_list fit flex column justify-between no-wrap">

    <q-list>
      <q-item-label header>{{ $t('language_string') }}</q-item-label>

      <q-item v-for="language in language_list"
              :key="language.id"
              :class="{ 'bg-blue-grey-2' : app_language == language.id }"
              @click="app_language = language.id"
              tag="label"
              v-ripple>

        <q-item-section avatar>
          <q-avatar
            class="position-relative">
            <img :src="language.src">
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <span class="text">{{language.label}}</span>
        </q-item-section>

      </q-item>

      <q-separator/>

      <q-item-label header>{{ $t('other') }}</q-item-label>

      <!-- dark_mode -->
      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('dark_mode') }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle color="blue-grey" v-model="dark_mode"/>
        </q-item-section>
      </q-item>


      <!-- timing -->
      <q-item tag="label"
              @click="timing_mode_toggle()"
              v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('timing') }}</q-item-label>
          <q-item-label caption>{{ $t('timing_description') }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-icon name="update" color="blue-grey-7"/>
        </q-item-section>
      </q-item>


      <!-- write -->
      <q-item tag="label"
              @click="show_send_dialog()"
              v-ripple>
        <q-item-section>
          <span class="text">{{ $t('write') }}</span>
        </q-item-section>

        <q-item-section side>
          <q-icon name="send" color="blue-grey-7"/>
        </q-item-section>

      </q-item>


    </q-list>


    <q-list>
      <q-item tag="label">
        <q-item-section>
          <q-item-label>author</q-item-label>
          <q-item-label caption>man@bonusuber.ru</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>


    <q-dialog v-model="prompt">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{$t('write_header')}}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined
                   v-model="contact"
                   :placeholder="$t('write_contact')"
                   autofocus/>
        </q-card-section>

        <q-card-section>
          <q-input outlined
                   type="textarea"
                   :placeholder="$t('write_letter')"
                   v-model="text"/>
        </q-card-section>


        <q-card-actions align="right" class="text-primary">
          <q-btn
            flat
            no-caps
            :label="$t('cancel')"
            v-close-popup/>
          <q-btn
            no-caps
            color="primary"
            :label="$t('send')"
            @click="sendMessage()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>


  </div>
</template>

<style lang="stylus">

  .active_q_item
    background-color: $primary
    color: $lighting;


  .custom_ticket_write_avatar
    background-color: #e1e1e1

    .img_wrap
      width 100%

      &.img_wrap__ticket
        padding 7px

      &.img_wrap__write
        padding 10px

      img
        opacity 0.6
</style>

<script>
    const flag_ru = require("../assets/icon_flag_ru.svg");
    const flag_ch = require("../assets/icon_flag_ch.svg");
    const flag_en = require("../assets/icon_flag_en.svg");
    export default {
        name: 'Language',
        data() {
            return {
                language_list: [
                    {
                        id: 'ch',
                        label: 'Chinese',
                        src: flag_ch
                    },
                    {
                        id: 'ru',
                        label: 'Русский',
                        src: flag_ru
                    },
                    {
                        id: 'en',
                        label: 'English',
                        src: flag_en
                    }
                ],
                prompt: false,

                text: '',
                contact: ''
            }
        },
        mounted() {

        },
        methods: {
            show_send_dialog() {
                this.prompt = true;
                ym(66456622, 'reachGoal', 'show_send_dialog')
            },
            sendMessage() {
                ym(66456622, 'reachGoal', 'send_msg');

                if (this.contact.length === 0) {
                    this.$q.notify({
                        type: 'warning',
                        message: 'Заполните поле с контактом'
                    })
                    return false;
                }

                if (this.text.length === 0) {
                    this.$q.notify({
                        type: 'warning',
                        message: 'Заполните поле текстом'
                    })
                    return false;
                }

                var bodyFormData = new FormData();
                bodyFormData.set('contact', this.contact);
                bodyFormData.set('text', this.text);

                this.$axios.post("/server_bridges/send_msg.php", bodyFormData)
                    .then((response) => {
                        let type = "";
                        if (response.data.includes("успешно")) {
                            type = 'positive';
                            this.text = "";
                            this.contact = "";
                            this.prompt = false;

                        } else if (response.data.includes("ошибки")) {
                            type = 'negative'
                        }

                        this.$q.notify({
                            type: type,
                            message: response.data
                        })
                    })
            },
            timing_mode_toggle() {
                ym(66456622, 'reachGoal', 'timing_mode_toggle')
                if (this.$store.state.timing_mode === null) {
                    this.$store.commit("setTiming_mode", +this.$moment())
                } else {
                    this.$store.commit("setTiming_mode", null)

                }
            }
        },
        computed: {
            dark_mode: {
                get() {
                    return this.$store.state.dark_mode;
                },
                set(value) {
                    if (value) {
                        localStorage.setItem("dark", true)
                    } else {
                        localStorage.removeItem("dark")
                    }

                    ym(66456622, 'reachGoal', 'dark_mode');
                    this.$store.commit("setDarkMode", value)
                }
            },
            gl_support() {
                return this.$store.state.gl_support;
            },
            app_language: {
                get() {
                    return this.$i18n.locale;
                },
                set(val) {
                    localStorage.setItem("spb_bridges_language", val)
                    this.$i18n.locale = val;
                }
            }
        },
        watch: {
            dark_mode(newVal) {
                let mapbox_styles;
                if (newVal) {
                    mapbox_styles = "mapbox://styles/mapbox/dark-v10";
                } else {
                    mapbox_styles = "mapbox://styles/mapbox/streets-v11";
                }

                if (!this.gl_support) {
                    L.mapbox.styleLayer(mapbox_styles).addTo(window.map);
                }
            }
        }
    }
</script>
