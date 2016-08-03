require('../support/test_helper');

// var assert = require('../support/assert');
var TestClient = require('../support/test_client');
var fs = require('fs');
var http = require('http');

describe('mapnik layer filtering', function() {
    var httpRendererResourcesServer;
    var testClient;

    before(function(done) {
        testClient = new TestClient(mapConfig);
        // Start a server to test external resources
        httpRendererResourcesServer = http.createServer( function(request, response) {
            var filename = __dirname + '/../fixtures/http/light_nolabels-1-0-0.png';
            fs.readFile(filename, {encoding: 'binary'}, function(err, file) {
                response.writeHead(200);
                response.write(file, "binary");
                response.end();
            });
        });
        httpRendererResourcesServer.listen(8033, done);
    });

    after(function(done) {
        httpRendererResourcesServer.close(done);
    });

    var mapConfig = {
        version: '1.2.0',
        layers: [
            {
                type: 'plain',
                options: {
                    color: '#fabada'
                }
            },
            {
                type: 'http',
                options: {
                    urlTemplate: 'http://127.0.0.1:8033/{s}/{z}/{x}/{y}.png',
                    subdomains: ['abcd']
                }
            },
            {
                type: 'mapnik',
                options: {
                    sql: 'SELECT * FROM populated_places_simple_reduced',
                    cartocss: '#layer { marker-fill:red; } #layer { marker-width: 2; }',
                    cartocss_version: '2.3.0'
                }
            },
            {
                type: 'mapnik',
                options: {
                    sql: 'SELECT * FROM populated_places_simple_reduced',
                    cartocss: '#layer { marker-fill:blue; } #layer { marker-width: 2; }',
                    cartocss_version: '2.3.0'
                }
            },
            {
                type: 'torque',
                options: {
                    sql: "SELECT * FROM populated_places_simple_reduced",
                    cartocss: [
                        'Map {',
                        '    buffer-size:0;',
                        '    -torque-frame-count:1;',
                        '    -torque-animation-duration:30;',
                        '    -torque-time-attribute:"cartodb_id";',
                        '    -torque-aggregation-function:"count(cartodb_id)";',
                        '    -torque-resolution:1;',
                        '    -torque-data-aggregation:linear;',
                        '}',
                        '#populated_places_simple_reduced{',
                        '    comp-op: multiply;',
                        '    marker-fill-opacity: 1;',
                        '    marker-line-color: #FFF;',
                        '    marker-line-width: 0;',
                        '    marker-line-opacity: 1;',
                        '    marker-type: rectangle;',
                        '    marker-width: 3;',
                        '    marker-fill: #FFCC00;',
                        '}'
                    ].join(' '),
                    cartocss_version: '2.3.0'
                }
            },
            {
                type: 'http',
                options: {
                    urlTemplate: 'http://127.0.0.1:8033/{s}/{z}/{x}/{y}.png',
                    subdomains: ['abcd']
                }
            },
            {
                type: 'torque',
                options: {
                    sql: "SELECT * FROM populated_places_simple_reduced " +
                        "where the_geom && ST_MakeEnvelope(-90, 0, 90, 65)",
                    cartocss: [
                        'Map {',
                        '    buffer-size:0;',
                        '    -torque-frame-count:1;',
                        '    -torque-animation-duration:30;',
                        '    -torque-time-attribute:"cartodb_id";',
                        '    -torque-aggregation-function:"count(cartodb_id)";',
                        '    -torque-resolution:1;',
                        '    -torque-data-aggregation:linear;',
                        '}',
                        '#populated_places_simple_reduced{',
                        '    comp-op: multiply;',
                        '    marker-fill-opacity: 1;',
                        '    marker-line-color: #FFF;',
                        '    marker-line-width: 0;',
                        '    marker-line-opacity: 1;',
                        '    marker-type: rectangle;',
                        '    marker-width: 3;',
                        '    marker-fill: #FFCC00;',
                        '}'
                    ].join(' '),
                    cartocss_version: '2.3.0'
                }
            }
        ]
    };

    var layerFilter = [1,2,3,4].join(',');
    it('should filter all mapnik layers on ' + layerFilter + '/1/0/0.png', function (done) {
        var options = {
            layer: layerFilter
        };

        testClient.getTile(1, 0, 0, options, function(err, tile) {
            if (err) {
                return done(err);
            }

            done(null, tile);
        });
    });

    var layerFilterFirstMapnik = [1,2,4].join(',');
    it('should filter first mapnik layer on ' + layerFilterFirstMapnik + '/1/0/0.png', function (done) {
        var options = {
            layer: layerFilterFirstMapnik
        };

        testClient.getTile(1, 0, 0, options, function(err, tile) {
            if (err) {
                return done(err);
            }

            done(null, tile);
        });
    });

    var layerFilterSecondMapnik = [1,3,4].join(',');
    it('should filter second mapnik layers on ' + layerFilterSecondMapnik + '/1/0/0.png', function(done) {
        var options = {
            layer: layerFilterSecondMapnik
        };

        testClient.getTile(1, 0, 0, options, function(err, tile) {
            if (err) {
                return done(err);
            }

            done(null, tile);
        });
    });

    var layerFilterMapnik = [2,3].join(',');
    it('should filter only mapnik layers on ' + layerFilterMapnik + '/1/0/0.png', function (done) {
        var options = {
            layer: layerFilterMapnik
        };

        testClient.getTile(1, 0, 0, options, function(err, tile) {
            if (err) {
                return done(err);
            }

            done(null, tile);
        });
    });
});