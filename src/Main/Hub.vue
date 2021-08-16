<template>
  <div id="hub">
  <CameraDebug v-show="debug"
               :camera="camera"
  ></CameraDebug>
  </div>
</template>

<script>
import CameraDebug from '@/Main/Hub/CameraDebug'

export default {
  components: {
    CameraDebug
  },
  props: {
    camera: Object
  },
  data () {
    return {
      debug: true
    }
  }
}
</script>

<style>
#hub {
  position: absolute;
  top: 0px;
  /* left: 8px; */
  color:rgba(127, 127, 127, 0.8);
  padding: 2px;
  margin: 8px;
  border-radius: 1%/5%;
}
</style>