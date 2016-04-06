var Pocedex = {

    pokemons: [],

    filters: [],

    selectedFilters: {},

    init: function() {
        // Load types
        $.getJSON('http://pokeapi.co/api/v1/type/?limit=100', function(data) {
            Pocedex.generateAllTypes(data.objects);
        });

        // Load pokemons
        Pocedex.showImageLoading();
        $.getJSON('http://pokeapi.co/api/v1/pokemon/?limit=12', function(data) {
            Pocedex.hideImageLoading();
            Pocedex.generateAllPokemons(data.objects);
            Pocedex.assignLoadMorePokemons(data.meta);
        });

        Pocedex.registerHandlebarsHelpers();
    },

    assignLoadMorePokemons: function(data) {
        var url = 'http://pokeapi.co' + data.next,
            loadMoreBtn = $('.container .load-more-btn');

        loadMoreBtn.find('a')
            .off('click')
            .on('click', function (e) {
                e.preventDefault();
                Pocedex.loadMorePokemons(url);
		});
    },

    loadMorePokemons: function(url) {
        Pocedex.showImageLoading();
        $.getJSON(url, function(data) {
            Pocedex.hideImageLoading();
            Pocedex.generateAllPokemons(data.objects);
            Pocedex.assignLoadMorePokemons(data.meta);
        });
    },

    generateAllTypes: function(data) {
        Pocedex.addFilters(data);

        var typeList = $('.container .type-checkbox-grid');
		var source = $("#pokedex-type-template").html();
		var template = Handlebars.compile(source);
        typeList.append(template(data));

        typeList.find('input[type=checkbox]')
            .off('click')
            .on('click', function(e) {
                var typeName = $(this).data('filter-name');
                if ($(this).is(":checked")) {

                    Pocedex.selectedFilters[typeName] = Pocedex.filters[typeName];
                    Pocedex.generateFilteredPokemons(Pocedex.selectedFilters);
                }

                if (!$(this).is(":checked")) {
                    $('.container .pokedex-container').find('.pokemons-content').remove();

                    if (typeName in Pocedex.selectedFilters) {
                        delete Pocedex.selectedFilters[typeName];
                    }

                    Pocedex.generateFilteredPokemons(Pocedex.selectedFilters);

                    if (typeList.find('input:checkbox:checked').length == 0) {
                        Pocedex.renderPokemonGrid(Pocedex.pokemons);
                    }
                }
		});
    },

    generateAllPokemons: function(data) {
        Pocedex.addPokemons(data);
        Pocedex.renderPokemonGrid(data);
	},

    generateFilteredPokemons: function (selectedFiltersObj) {
        var filteredPokemons = [];

        $.each(selectedFiltersObj, function(typeKey, pokemonIds) {
            pokemonIds.forEach(function(filter) {
                if (filter in Pocedex.pokemons) {
                    filteredPokemons.push(Pocedex.pokemons[filter]);
                }
            });
        });

        // Remove previous pokemons content
        $('.container .pokedex-container').find('.pokemons-content').empty();
        Pocedex.renderPokemonGrid(filteredPokemons);
    },

    renderPokemonGrid: function(data) {
        var pokemonList = $('.container .pokedex-container');
		var source = $("#pokedex-template").html();
		var template = Handlebars.compile(source);

        pokemonList.append(template(data));

		// Show card info
        pokemonList.find('.panel-body')
            .off('click')
            .on('click', function(e) {
                e.preventDefault();
                var pokemonId = parseInt($(this).data('pokemon-id'));
                Pocedex.showPokemonInfo(pokemonId);
		});

        // Card types
        pokemonList.find('.btn-type')
            .off('click')
            .on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                // var typeId = $(this).data('type-id');
                var typeText = $(this).text();
                $('.container .type-checkbox-grid').find('input[data-filter-name='+ typeText +']').click();
                $('#type-filter-container').show();
		});
    },

    addPokemons: function(data) {
        data.forEach(function(item) {
            Pocedex.pokemons[item['pkdx_id']] = item;

            // Fill filters
            item['types'].forEach(function(type) {
                if (type['name'] in Pocedex.filters) {
                    Pocedex.filters[type['name']].push(item['pkdx_id']);
                }
            });
        });
    },

    addFilters: function (data) {
        data.forEach(function(item) {
            var filterName = item['name'].toLowerCase();
            Pocedex.filters[filterName] = [];
        });
    },

    showPokemonInfo: function(pokemonId) {
        $('.container .detailed-info-content .col-md-12').remove();

        var singlePokemon = Pocedex.pokemons[pokemonId];
        var detailedInfo = $('.container .detailed-info-content'),
            source = $("#pokedex-info-template").html(),
            template = Handlebars.compile(source);
		detailedInfo.append(template(singlePokemon));
    },

    showImageLoading: function() {
        $('#loading').show();
    },

    hideImageLoading: function() {
        $('#loading').hide();
    },

    registerHandlebarsHelpers: function() {
        Handlebars.registerHelper('splitTypeId', function(typeResourceUri) {
            var piece = typeResourceUri.split('/');
            return parseInt(piece[4]);
        });

        Handlebars.registerHelper('padPokemonId', function(id) {
            var pokemonId = '#' + id;

            if (id < 10) {
                pokemonId = '#00' + id;
            } else if (id < 100) {
                pokemonId = '#0' + id;
            }

            return pokemonId;
        });

        Handlebars.registerHelper('toLowerCase', function(str) {
            return str.toLowerCase();
        });
    }
};


$(document).ready(function() {

    Pocedex.init();

    // Show/hide types items
    $('#type-checkbox-btn').on('click', function(e) {
        var target = e.target;
        $('#type-filter-container').toggle(300, function() {
            $(target).html($(this).is(':visible') ? 'Hide types' : 'Show types')
        });

        return false;
    });

    /*
    $('#loading').hide()
        .ajaxStart(function() {
            $(this).show();
        })
        .ajaxStop(function() {
            $(this).hide();
        });
        */

    if (!!$('.sticky-detailed-info').offset()) {
        var stickyTop = $('.sticky-detailed-info').offset().top,
            detailedInfoWidth = $('#detailed-info-container').width();

        $(window).scroll(function() {
            var windowTop = $(window).scrollTop(),
                windowWidth = $(window).width(),
                sidebarWidth = $('#detailed-info-container').width() < detailedInfoWidth
                               ? $('#detailed-info-container').width()
                               : detailedInfoWidth;

            if (stickyTop < windowTop && windowWidth > 974) {
                $('.sticky-detailed-info').css({ position: 'fixed', top: 10, width: sidebarWidth });
            } else {
                $('.sticky-detailed-info').css({ position: 'static', width: 'auto'});
            }
        });
    }

});
