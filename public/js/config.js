require.config({

  baseUrl: 'public/js',

  deps: ['main'],

  paths: {
    jQuery: '//cdnjs.cloudflare.com/ajax/libs/jquery/1.8.3/jquery.min',
    Moment: 'plugins/moment'
  },

  shim: {
    jQuery: {
      exports: 'jQuery'
    },
    Moment: {
      deps: ['jQuery'],
      exports: 'jQuery'
    }
  },

  waitSeconds: 20

});
