var Pocedex = {

    pokemons: [],

    filters: [],

    selectedFilters: {},

    init: function() {
        $.getJSON('http://pokeapi.co/api/v1/type/?limit=100', function(data) {
            Pocedex.generateAllTypes(data.objects);
        });

        $.getJSON('http://pokeapi.co/api/v1/pokemon/?limit=12', function(data) {
            Pocedex.generateAllPokemons(data.objects);
            Pocedex.assignLoadMorePokemons(data.meta);
        });

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
        $.getJSON(url, function(data) {
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
                
                Pocedex.selectedFilters[typeName] = Pocedex.filters[typeName];
                Pocedex.generateFilteredPokemons(Pocedex.selectedFilters);            
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

        $('.container .pokedex-container').find('.pokemons-content').empty();
        Pocedex.renderPokemonGrid(filteredPokemons);
    },

    renderPokemonGrid: function(data) {
        var pokemonList = $('.container .pokedex-container');
		var source = $("#pokedex-template").html();
		var template = Handlebars.compile(source);

        pokemonList.append(template(data));

		pokemonList.find('.panel-body')
            .off('click')
            .on('click', function(e) {
                e.preventDefault();
                var pokemonId = parseInt($(this).data('pokemon-id'));
                Pocedex.showPokemonInfo(pokemonId);
		});

        pokemonList.find('.btn-type')
            .off('click')
            .on('click', function(e) {
                e.preventDefault();
                var typeText = $(this).text();
                $('.container .type-checkbox-grid').find('input[data-filter-name='+ typeText +']').click();
                $('#type-filter-container').show();
		});
    },

    addPokemons: function(data) {
        data.forEach(function(item) {
            Pocedex.pokemons[item['pkdx_id']] = item;            
        });
    },
};


$(document).ready(function() {

    Pocedex.init();

});
