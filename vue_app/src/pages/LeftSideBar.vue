<template>
  <div class="aside_list">
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

      <!--      <q-item tag="label"-->
      <!--              v-ripple>-->
      <!--        <q-item-section>Тайминг</q-item-section>-->
      <!--      </q-item>-->


      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>{{ $t('dark_mode') }}</q-item-label>
          <!--          <q-item-label caption>Allow notification</q-item-label>-->
        </q-item-section>
        <q-item-section side>
          <q-toggle color="blue-grey" v-model="dark_mode" val="friend"/>
        </q-item-section>
      </q-item>


      <q-item tag="label"
              @click="prompt = true"
              v-ripple>
        <q-item-section>
          <span class="text">{{ $t('write') }}</span>
        </q-item-section>

        <q-item-section side>
          <q-icon name="send" color="blue-grey-7"/>
        </q-item-section>

      </q-item>


      <q-item tag="label"
              @click="timing_mode_toggle()"
              v-ripple>
        <q-item-section>
          <span class="text">{{ $t('timing') }}</span>
        </q-item-section>

        <q-item-section side>
          <q-icon name="update" color="blue-grey-7"/>
        </q-item-section>
      </q-item>


    </q-list>


    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Мы открыты к диалогу</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined
                   v-model="contact"
                   placeholder="Ваш контакт"
                   autofocus/>
        </q-card-section>

        <q-card-section>
          <q-input outlined
                   type="textarea"
                   placeholder="Письмо"
                   v-model="text"/>
        </q-card-section>


        <q-card-actions align="right" class="text-primary">
          <q-btn
            flat
            no-caps
            label="Отмена"
            v-close-popup/>
          <q-btn
            no-caps
            color="primary"
            label="Отправить"
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
                        label: 'China',
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
                dark_mode: false,
                prompt: false,

                text: '',
                contact: ''
            }
        },
        mounted(){
            const dark_local = localStorage.getItem("dark");
            this.dark_mode = dark_local ? !!dark_local : false;
        },
        methods: {
            sendMessage() {
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

                this.$axios.post("http://bonusuber.ru/spb-bridges-map/index.php", bodyFormData)
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
                if (this.$store.state.timing_mode === null) {
                    this.$store.commit("setTiming_mode", +moment())
                } else {
                    this.$store.commit("setTiming_mode", null)

                }
            }
        },
        computed: {
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
                let mapbox_styles = ""
                if (newVal) {
                    this.$q.dark.set(true)
                    mapbox_styles = 'mapbox://styles/mapbox/dark-v10';
                    localStorage.setItem("dark", true)
                } else {
                    this.$q.dark.set(false)
                    mapbox_styles = 'mapbox://styles/mapbox/streets-v11';
                    localStorage.removeItem("dark")
                }
                L.mapbox.styleLayer(mapbox_styles).addTo(window.l_map);
            }
        }
    }
</script>
