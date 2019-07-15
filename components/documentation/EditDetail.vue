<template>
  <v-flex
    grow>
    <v-card>
      <v-card-title>
        {{title}}
      </v-card-title>
      <v-card-text>
        <v-textarea
          :value="textContent + ' ' + (defaultValue ? '(default: ' + defaultValue + ')' : '')"
          solo
          readonly
          light
        ></v-textarea>
      </v-card-text>
    </v-card>
  </v-flex>
</template>
<script>
  export default {
    name: "EditDetail",
    props: [
      'title',
      'textContent',
      'defaultValue'
    ]
  };
</script>