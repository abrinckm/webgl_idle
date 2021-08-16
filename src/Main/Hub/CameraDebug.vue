<template>
  <div id="cam-debug" ref="cam-debug">
    Camera
    <table>
      <tr>
        <td></td>
        <td>
          Position
        </td>
        <td></td>
      </tr>
      <tr>
        <td>
        </td>
        <td>
          x: {{camera.v3Position[0].toFixed (5)}}
        </td>
        <td>
          y: {{camera.v3Position[1].toFixed (5)}}
        </td>
        <td>
          z: {{camera.v3Position[2].toFixed (5)}}
        </td>
      </tr>
      <tr>
        <td></td>
        <td>Rotation</td>
        <td></td>
      </tr>
      <tr>
        <td></td>
        <td>
          pitch: {{camera.fPitch.toFixed (5)}}
        </td>
        <td>
          yaw: {{camera.fYaw.toFixed (5)}}
        </td>
        <td></td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    camera: Object
  }
}
</script>

<style scoped>
td {
  /* border: 1px solid; */
  padding: 0px 8px 0px 8px;
  /* text-align:right */
}
</style>