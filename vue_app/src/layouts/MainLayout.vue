<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-blue-grey-5 text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left"/>

        <q-toolbar-title class="flex items-center no-wrap">
          <q-avatar>🌉</q-avatar>
          <div>{{ $t('header_title') }}</div>
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="right = !right"/>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="left" side="left" bordered>
      <LeftSideBar/>
    </q-drawer>

    <q-drawer show-if-above v-model="right" side="right" bordered>
      <RightSideBar/>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-footer elevated class="bg-blue-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar :size="'50px'">
            <canvas id="canvas" width="42" height="42"/>
          </q-avatar>
          {{ $t('time_footer') }} -
          {{ Time.format("HH:mm:ss") }}
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>


<script>
    import RightSideBar from '../pages/RightSideBar.vue'
    import LeftSideBar from '../pages/LeftSideBar.vue'


    export default {
        name: 'MainLayout',
        components: {RightSideBar, LeftSideBar},
        data() {
            return {
                left: false,
                right: false
            }
        },
        computed: {
            app_language() {
                return this.$i18n.locale;
            },
            Time() {
                return this.$store.state.Time
            }
        },
        mounted() {
            var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");
            var radius = canvas.height / 2;
            ctx.translate(radius, radius);
            radius = radius * 0.90;


            setInterval(() => {
                this.drawFace(ctx, radius);
                this.drawTime(ctx, radius);
            }, 1000);
        },
        methods: {
            drawFace(ctx, radius) {
                var grad;
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, 2 * Math.PI);
                ctx.fillStyle = 'white';
                ctx.fill();
                // grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
                // grad.addColorStop(0, '#333');
                // grad.addColorStop(0.5, 'white');
                // grad.addColorStop(1, '#333');
                // ctx.strokeStyle = grad;
                // ctx.lineWidth = radius * 0.1;
                // ctx.stroke();
                // ctx.beginPath();
                // ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
                // ctx.fillStyle = '#333';
                // ctx.fill();
            },
            drawTime(ctx, radius) {
                var now = this.Time;
                var hour = now.hours();
                var minute = now.minute();
                var second = now.seconds();
                //hour
                hour = hour % 12;
                hour = (hour * Math.PI / 6) +
                    (minute * Math.PI / (6 * 60)) +
                    (second * Math.PI / (360 * 60));
                this.drawHand(ctx, hour, radius * 0.5, radius * 0.07);
                //minute
                minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
                this.drawHand(ctx, minute, radius * 0.8, radius * 0.07);
                // second
                second = (second * Math.PI / 30);
                this.drawHand(ctx, second, radius * 0.9, radius * 0.02);
            },
            drawHand(ctx, pos, length, width) {
                ctx.beginPath();
                ctx.lineWidth = width;
                ctx.lineCap = "round";
                ctx.moveTo(0, 0);
                ctx.rotate(pos);
                ctx.lineTo(0, -length);
                ctx.stroke();
                ctx.rotate(-pos);
            }
        },
    }
</script>
