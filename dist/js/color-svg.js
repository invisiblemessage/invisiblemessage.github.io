var ColorSVG = {
    version : '0.1.0',

    settings : {
        current_color: null,
        size: 40,
        multiplier: 8,
        row_width: 20,
        animation_speed: 250,
        animation_type: 'backout' // options: backin, backout, bounce, easein, easeinout, easeout, linear
    },

    NS : 'http://www.w3.org/2000/svg',

    init : function (scope, options) {
        var self = this;
        this.scope = scope || 'input.color-picker';

        var pickers = this.scope instanceof jQuery ? this.scope : $(this.scope);

        $.extend(true, this.settings, options);

        if (pickers.length > 0) {
            pickers.each(function () {
                var input = $(this);
                if (input.is(':input')) {
                    input.attr('type','hidden')
                         .data('options', {color: input.val()});
                }

                return self.build(input, options);
            });
        }

        //this.events();
    },

    setColor : function(input, color, svg) {
        if (!svg) {
            var container = $(this.identifier(input)),
                svg = $('svg', container);
      
        }

        if (color && color.length == 6) color = '#' + color;

        if (color) {
            if (color === 'rgb(185, 58, 51)') {
                microgear.chat("color", '1');
            }
            else if (color === 'rgb(254, 245, 108)') {
                microgear.chat("color", '2');
            }
            else if (color === 'rgb(39, 102, 153)') {
                microgear.chat("color", '3');
            }
           
            else if (color === 'rgb(165, 194, 148)') {
                microgear.chat("color", '4');
            }

            else if (color === 'rgb(248, 143, 88)') {
                microgear.chat("color", '5');
            }

            else if (color === 'rgb(177, 143, 170)') {
                microgear.chat("color", '6');
            }


        }
        var circle = Snap($('.selected-color', svg)[0]);

        circle.attr({
            opacity: color ? 1 : 0,
            fill: color || "#000000"
        });

        if (input.is(':input')) {
            input.val(color);
        }
    },

    build : function(input, options) {
        var _settings = $.extend({}, this.settings, options, input.data('options'));
        input.data('settings', _settings);

        if (!input.data('color-id')) {
            var id = "color" + Math.round(Math.random()*10000),
                div = $('<div id="'+id+'" class="color-svg-picker"/>');
            input.data('color-id', id);
            $(input).after(div);
            div.width(_settings.size).height(_settings.size);
        }
        var self = this;
        setTimeout(function() {
            self.updateDOM(self.picker(input));
            self.events(input, _settings);
        }, 1);
    },

    events : function (input, settings) {
        var self = this;

        $('svg', this.identifier(input)).hover(function(e) {
            var dimen = settings.size + self.padding(settings)*2;
            $(this).width(dimen).height(dimen)[0].setAttribute('viewBox', ['0 0',dimen,dimen].join(' '));
            $(this).css({margin: -self.padding(settings)});

            self.animateHover(input, settings);
        }, function(e) {
            self.close(input, settings, this);
        });
    },

    close: function (input, settings, svg) {
        var dimen = settings.size,
            elem = svg || $('svg', this.identifier(input)),
            padding = this.padding(settings);

        this.animateHover(input, settings, function() {
            $(elem).width(dimen).height(dimen)[0].setAttribute('viewBox', [padding,padding,dimen,dimen].join(' '));
            $(elem).css({margin: 0});
        });
    },

    updateDOM : function (parts) {
        var input = parts[0],
            graph = parts[1];

        return $(this.identifier(input)).html(graph);
    },

    animateHover : function(input, settings, close_callback) {
        var container = $(this.identifier(input)),
            svg = $('svg', container),
            base = settings.size + (this.padding(settings)*2),
            cx = base/2,
            cy = base/ 2;

        var groups = $('g[data-id]', svg);

        for (var g = 0; g < groups.length; g++) {
            var group = groups[g],
                id = parseInt(group.getAttribute('data-id').replace("g",""), 10),
                scale = close_callback ? 1 : id + 2,
                do_callback = g == 0,
                animation = settings.animation_type,
                speed = settings.animation_speed * (g+1);

            if (!id) {
                if (!close_callback) {
                    var half = settings.size/2;
                    scale = (half-5) / half;
                }
                animation = 'easein';
                speed = settings.animation_speed * 1.5;
            }

            Snap(group).stop().animate({
              transform: 's' + scale + ' ' + scale + ' ' + cx + ' ' + cy
            }, speed, mina[animation], do_callback ? close_callback || null : null);
        }

        var circle = $('.selected-color', svg)[0],
            cir = Snap(circle);
        cir.stop().animate({
            transform: 's' + scale + ' ' + scale + ' ' + cx + ' ' + cy
        }, speed, mina[animation]);
    },

    picker: function(input) {
        var settings = input.data('settings'),
            svg = this.svg(input, settings),
            container = $(this.identifier(input)),
            base = container.outerWidth(),
            padding = this.padding(settings);

        var _colors = this.defaultColors.slice();
        _colors.reverse();
        // Add the last group twice the effect
        // TODO: Allow multiple colors for display: _colors.push(_colors[_colors.length-1]);

        for (var c=0; c < _colors.length; c++) {

            var start_angle = 0,
                angle = (1 / _colors[c].length) * Math.PI * 2,
                data = _colors[c],
                level = _colors.length - (c+1);

            for (var i = 0; i < data.length; i++) {
                var end_angle = start_angle + angle;
                var cx = (base / 2) + padding,
                    cy = (base / 2) + padding,
                    r =  (base / 2),
                    innerR = r - 5,
                    pid = [level,i].join('');

                var existing_path = $('path[data-id="s' + pid + '"]', svg);

                if (existing_path.length > 0) {
                    var path = existing_path[0];
                } else {
                    var path = this.svg_obj('path');
                }

                this.annular_sector(path, {
                    centerX:cx, centerY:cy,
                    startDegrees:start_angle, endDegrees:end_angle,
                    innerRadius: level==0 ? 0 : ((innerR + ((level-1) * settings.row_width)) / (level+2)),
                    outerRadius: level==0 ? r : ((innerR + ((level) * settings.row_width)) / (level+2))
                });
                this.set_attr(path, {
                    fill: '#'+data[i],
                    //stroke: settings.stroke_color,
                    //'strokeWidth': settings.stroke_width,
                    'data-cx' : cx,
                    'data-cy' : cy,
                    'data-id' : 's' + pid
                });

                var existing_group = $('g[data-id=g' + level + ']', svg);

                if (existing_group.length < 1) {
                    var g = this.svg_obj('g');

                    g.setAttribute('data-id', 'g' + level);
                    g.appendChild(path);
                    svg.appendChild(g);

                }
                else {
                    existing_group[0].appendChild(path);
                }

                if (level) {
                    var el = Snap(path);
                    this.animate(el, cx, cy, settings, level);
                    this.action(el, input, settings);
                }

                // The next wedge begins where this one ends
                start_angle = end_angle;
            }
        }

        var snp = Snap(svg),
            coloredCircle = snp.circle(cx, cy, (base/2)+0.1),
            circleOverlay = Snap(svg).circle(cx, cy, (base / 2)-5);

        coloredCircle.attr({
            'class': 'selected-color'
        });

        this.setColor(input, settings.color, svg);

        circleOverlay.attr({
            'class': 'icon'
        });

        var pencil = this.svg_obj('g'),
            pinner = this.svg_obj('path');
        this.set_attr(pencil, {
            'transform': "translate("+[cx-7,cy-7].join(' ')+")"
        });
        this.set_attr(pinner, {
            'd': "M11.4,7.7c0,2.4-4.2,4.4-4.2,4.4s-4.2-2-4.2-4.4s1.8-3.9,4.2-2.8C9.5,3.7,11.4,5.3,11.4,7.7z",
            'class': "pencil"
        });
        pencil.appendChild(pinner);
        svg.appendChild(pencil);

        return [input, svg];
    },

    action : function (el, input, settings) {
        var self = this;

        el.click(function(e) {
            var path = Snap(e.target);

            var color = path.attr('fill');
            path.attr({
                strokeWidth: 0
            });

            self.setColor(input, color);

            self.close(input, settings);
        });
    },
    animate : function (el, cx, cy, settings, level) {
        var self = this,
            base_scale = 1,
            scale = base_scale + 0.05;

        el.hover(function (e) {
            var path = Snap(e.target);

            // Move to the front
            path.appendTo(path.parent());

            path.attr({
                strokeWidth: 1/(level+ 2)
            });
            path.stop().animate({
                transform: 's' + scale + ' ' + scale + ' ' + cx + ' ' + cy
            }, settings.animation_speed, mina[settings.animation_type]);

        }, function (e) {
            var path = Snap(e.target);

            path.attr({
                strokeWidth: 0
            });
            path.stop().animate({
                transform: 's' + base_scale + ' ' + base_scale + ' ' + cx + ' ' + cy
            }, settings.animation_speed, mina[settings.animation_type]);
        });

    },


    annular_sector : function (path, options) {
        var opts = optionsWithDefaults(options);

        var p = [ // points
            [opts.cx + opts.r2*Math.sin(opts.startRadians),
                opts.cy - opts.r2*Math.cos(opts.startRadians)],
            [opts.cx + opts.r2*Math.sin(opts.closeRadians),
                opts.cy - opts.r2*Math.cos(opts.closeRadians)],
            [opts.cx + opts.r1*Math.sin(opts.closeRadians),
                opts.cy - opts.r1*Math.cos(opts.closeRadians)],
            [opts.cx + opts.r1*Math.sin(opts.startRadians),
                opts.cy - opts.r1*Math.cos(opts.startRadians)],
        ];

        var angleDiff = opts.closeRadians - opts.startRadians;
        var largeArc = (angleDiff % (Math.PI*2)) > Math.PI ? 1 : 0;
        var cmds = [];
        cmds.push("M"+p[0].join());                                // Move to P0
        cmds.push("A"+[opts.r2,opts.r2,0,largeArc,1,p[1]].join()); // Arc to  P1
        cmds.push("L"+p[2].join());                                // Line to P2
        cmds.push("A"+[opts.r1,opts.r1,0,largeArc,0,p[3]].join()); // Arc to  P3
        cmds.push("z");                                // Close path (Line to P0)
        this.set_attr(path, {
            'stroke': 'white',
            'stroke-width': 0,
            'd': cmds.join(' ')
        });


        function optionsWithDefaults(o){
            // Create a new object so that we don't mutate the original
            var o2 = {
                cx           : o.centerX || 0,
                cy           : o.centerY || 0,
                startRadians : (o.startDegrees || 0),
                closeRadians : (o.endDegrees   || 0),
            };

            var t = o.thickness!==undefined ? o.thickness : 100;
            if (o.innerRadius!==undefined)      o2.r1 = o.innerRadius;
            else if (o.outerRadius!==undefined) o2.r1 = o.outerRadius - t;
            else                                o2.r1 = 200           - t;
            if (o.outerRadius!==undefined)      o2.r2 = o.outerRadius;
            else                                o2.r2 = o2.r1         + t;

            if (o2.r1<0) o2.r1 = 0;
            if (o2.r2<0) o2.r2 = 0;

            return o2;
        }
    },

    padding : function(settings) {
        return (this.defaultColors.length-1) * settings.row_width;
    },
    svg : function (input, settings) {
        var container = $(this.identifier(input)),
            svg = $('svg', container),
            width = container.width(),
            height = container.height();

        if (svg.length > 0) {
            svg = svg[0];
        } else {
            var svg = this.svg_obj('svg');
            svg.width = width;
            svg.height = height;
        }

        var padding = this.padding(settings);

        var view_box = padding + ' ' + padding + ' ' +
            (width) + ' ' +
            (height);

        this.set_attr(svg, {width: '100%', height: '100%', viewBox: view_box});

        return svg;
    },

    identifier : function (input) {
        return '#' + input.data('color-id');
    },

    throttle : function(fun, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fun.apply(context, args);
            }, delay);
        };
    },

    svg_obj : function (type) {
        return document.createElementNS(this.NS, type);
    },

    ticks: function (min, max, count) {
        var span = max - min,
            step = Math.pow(10, Math.floor(Math.log(span / count) / Math.LN10)),
            err = count / span * step;

        // Filter ticks to get closer to the desired count.
        if (err <= .15) step *= 10;
        else if (err <= .35) step *= 5;
        else if (err <= .75) step *= 2;

        // Round start and stop values to step interval.
        var tstart = Math.ceil(min / step) * step,
            tstop = Math.floor(max / step) * step + step * .5,
            ticks = [],
            x;

        // now generate ticks
        for (i=tstart; i < tstop; i += step) {
            ticks.push(i);
        }
        return ticks;
    },

    set_attr : function (node, attrs) {

        for (attr in attrs) {
            node.setAttribute(attr, attrs[attr]);
        }

        return this;
    },

    flip : function (node, h) {
        node.setAttribute('transform', 'translate(0, ' + h +') scale(1, -1)');
    },

    defaultColors: [
        // Inner circle (not selectable)
        [
            'ff5c4d',     
        ],
        // First Row of Colors
        [
            'c81717',
           
        ],
        // Second Row of Colors
        [
            '982424',
           
        ],

        // Outer Row of Colors
        [
		
		 // purple
            'b18faa',   			
			
		 // Blue
            '276699',
			
         // Green
            'a5c294',
			
			            
         // Yellow
            'fef56c',
			
         // Orange
            'f88f58',
            
         // red
            'b93a33',

            

            

            

           
         
        ]

    ]

};
