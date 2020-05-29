$(document).ready(function() {

    $('button').click(function () {
        searchMovieSeriesTv();
        newSearch();
    });

    $('.search').keypress(function(event) {
        if(event.which == 13 ){
            searchMovieSeriesTv();
            newSearch();
        };
    });

    $('#genere').change(function() {
        var genereSelettore = $('#genere').val();
        if (genereSelettore == "") {
            $('.film').show();
        } else {
            $('.film').hide();
            $('.film').each(function() {
                var genereCorrente = $(this).attr('data-genere');
                if (genereCorrente.toLowerCase().includes(genereSelettore.toLowerCase())) {
                    $(this).show();
                }
            });
        }
    })

    var generi = [];
    var generiSerie = [];

    // chiamata ajax per i generi movie
    $.ajax({
        // uso url della api di themoviedb
        'url': 'https://api.themoviedb.org/3/genre/movie/list',
        // allego questi dati all'url
        'data': {
            // la mia chiave api
            'api_key': '8f20fb07349b7328a5884d56f17b612d'
        },
        'method': 'GET',
        'success': function(data) {
            generi = data.genres;
        },
        // in caso di errore
        'error': function() {
            alert('Error');
        }
    });

    // chiamata ajax per i generi serie tv
    $.ajax({
        // uso url della api di themoviedb
        'url': 'https://api.themoviedb.org/3/genre/tv/list',
        // allego questi dati all'url
        'data': {
            // la mia chiave api
            'api_key': '8f20fb07349b7328a5884d56f17b612d'
        },
        'method': 'GET',
        'success': function(data) {
            generiSerie = data.genres;
            console.log(generiSerie);
        },
        // in caso di errore
        'error': function() {
            alert('Error');
        }
    });

    function newSearch(ricerca) {
        $('.film-container').empty();
        $('.serieTv-container').empty();
    }

    // funzione per ricercare i film e serieTv
    function searchMovieSeriesTv(ricerca) {
        var ricerca = $('.header-right input').val();
        var linguaCorrente = $('.lingua').val();
        if (ricerca != 0) {
            $('.layout').hide();
            $('main p').addClass('active');
            $('main p:first-child').text('Risultato ricerca: "' + ricerca +'"');
            MDBapiCall(ricerca, 'search', 'movie', linguaCorrente, '.film-container');
            MDBapiCall(ricerca, 'search', 'tv', linguaCorrente, '.serieTv-container');
        } else {
            $('.category').removeClass('active');
            $('main p:first-child').text('Inserisci un titolo di un film o serie tv.');
        }
    };

    function MDBapiCall(ricerca, action, type, lingua, container) {
        $.ajax({
            // uso url della api di themoviedb
            'url': 'https://api.themoviedb.org/3/' + action + '/' + type + '/',
            // allego questi dati all'url
            'data': {
                // la mia chiave api
                'api_key': '8f20fb07349b7328a5884d56f17b612d',
                // il query, che sarebbe il titolo del film, in questo caso quelo che scrive l'utente
                'query': ricerca,
                // la lingua italiana
                'language': lingua
            },
            'method': 'GET',
            'success': function(data) {
                if(data.total_results > 0) {
                    var film = data.results;
                    // richiamo la funzione delle informazione del film
                    infoShow(film);
                } else {
                    $(container).append('Nessun risultato trovato.');
                }
                $('.header-right input').val('');
            },
            // in caso di errore
            'error': function() {
                alert('Error');
            }
        });
    }

    // creo una funzione per estrarre le informazione dei film dall'api
    function infoShow(show) {
        var templateFunction = Handlebars.compile($('#template').html());
        // uso un ciclo for visto che mi verrà restituita un array di oggetti
        for (var i = 0; i < show.length; i++) {
            // creo le varie variabili per andare a prendere i dati di cui ho bisogno
            var titleMovie = show[i].title;
            var titleSerieTV = show[i].name;
            var originalTitleMovie = show[i].original_title;
            var originalTitleSerieTV = show[i].original_name;
            var language = show[i].original_language;
            var genre = show[i].genre_ids;
            var stringaGeneriMovie = recuperaGeneri(genre, generi);
            var stringaGeneriSerie = recuperaGeneri(genre, generiSerie);
            // arrotondo per eccesso il numero della votazione e diviso per due per fare la votazione da 0 a 5
            var voto = Math.ceil((show[i].vote_average) / 2);
            var img = 'https://image.tmdb.org/t/p/w342' + show[i].poster_path;
            if (show[i].poster_path == null) {
                img = 'https://www.wildhareboca.com/wp-content/uploads/sites/310/2018/03/image-not-available.jpg';
            }
            var description = show[i].overview;
            if (description.length == 0) {
                description = 'No description available.'
            }
            var id = show[i].id;
            // info da sostituire nel mio handlebars template
            var info = {
                'title': titleMovie || titleSerieTV,
                'original-title': originalTitleMovie || originalTitleSerieTV,
                'language': flags(language),
                'vote': starRating(voto),
                'poster': img,
                'overview': description,
                'id': id,
                'genre': stringaGeneriMovie || stringaGeneriSerie
            };
            // creo una variabile che mi compili le info con una funzione
            var html = templateFunction(info);
            //  le appendo al container
            if (titleMovie && originalTitleMovie) {
                $('.film-container').append(html);

            } else {
                $('.serieTv-container').append(html);
            }
        };
    };

    // funzione che mi converte il voto in stelle
    function starRating(voto) {
        var stellaPiena = '<i class="fas fa-star"></i>';
        var stellaVuota = '<i class="far fa-star"></i>';
        var stelle = '';
        for (var j = 0; j < 5; j++) {
            if (j < voto) {
                stelle = stelle + stellaPiena;
            } else {
                stelle = stelle + stellaVuota;
            }
        }
        return stelle
    }

    // funzione per sostiture la lingua con le proprie bandiere
    function flags(flag) {
        // aggiungo i vari casi delle lingue per sostituire con le bandiere
        switch (flag) {
            case 'en':
                var flag = '<img src="https://www.countryflags.io/us/flat/24.png">';
                break;
            case 'it':
                var flag = '<img src="https://www.countryflags.io/it/flat/24.png">';
                break;
            case 'es':
                var flag = '<img src="https://www.countryflags.io/es/flat/24.png">';
                break;
            case 'de':
                var flag = '<img src="https://www.countryflags.io/de/flat/24.png">';
                break;
            case 'fr':
                var flag = '<img src="https://www.countryflags.io/fr/flat/24.png">';
                break;
            case 'ja':
                var flag = '<img src="https://www.countryflags.io/jp/flat/24.png">';
                break;
            default:
                var flag = flag;
        }
        return flag
    }

    // funzione per recuperare i nomi dei generi
    function recuperaGeneri(idList, tipo) {
        var generiFilm = [];
        // ciclo che scorre i generi dei film
        for (var i = 0; i < idList.length; i++) {
            // genere corrente
            var currentGenre = idList[i];
            // ciclo che scorre tutti i generi del database
            for (var j = 0; j < tipo.length; j++) {
                var element = tipo[j];
                var genereId = element.id;
                if (currentGenre == genereId) {
                    var nomeGenere = element.name;
                    generiFilm.push(nomeGenere);
                }
            }
        }
        return generiFilm.join(', ')
    }
});

// Milestone 5 (Opzionale):Partendo da un film o da una serie, richiedere all'API quali sono gli attori che fannoparte del cast aggiungendo alla nostra scheda ​Film / Serie​ SOLO i primi 5 restituitidall’API con Nome e Cognome, e i generi associati al film con questo schema:“Genere 1, Genere 2, ...”.
//

// Milestone 6 (Opzionale):Creare una lista di generi richiedendo quelli disponibili all'API e creare dei filtri con igeneri tv e movie per mostrare/nascondere le schede ottenute con la ricerca
