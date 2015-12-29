'use strict';

var React = require('react-native');

var {
    ListView,
    Platform,
    ProgressBarAndroid,
    StyleSheet,
    Text,
    View
} = React;

var TimerMixin = require('react-timer-mixin');

var MovieCell = require('./MovieCell');

var API_URL = 'http://api.rottentomatoes.com/api/public/v1.0/';
var API_KEYS = [
  '7waqfqbprs7pajbz28mqf6vz',
  // 'y4vwv8m33hed9ety83jmv52f', Fallback api_key
];

var resultsCache = {
    dataForQuery: {},
    nextPageNumberForQuery: {},
    totalForQuery:{}
}
var LOADING = {};

var searchScreen = React.createClass({
    mixin: [TimerMixin],
    timeoutID: (null: any),
    getInitialState: function() {
        return {
            isLoading: false,
            isLoadingTail: false,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2
            }),
            filter: '',
            queryNumber: 0
        }
    },
    componentDidMount: function() {
        this.searchMovies('');
    },
    _urlForQueryAndPage: function(query: string, pageNumber: number): string {
        var apiKey = API_KEYS[this.state.queryNumber % API_KEYS.length];
        if (query) {
            return (
                API_URL + 'movies.json?apikey=' + apiKey + '&q=' +
                encodeURIComponent(query) + '&page_limit=20&page=' + pageNumber
            );
        } else {
            // With no query, load latest movies
            return (
                API_URL + 'lists/movies/in_theaters.json?apikey=' + apiKey +
                '&page_limit=20&page=' + pageNumber
            );
        }
    },
    searchMovies: function(query: string) {
        this.timeoutID = null;
        this.setState({filter: query});

        var cachedResultsForQuery = resultsCache.dataForQuery[query];
        if (cachedResultsForQuery) {
            if (!LOADING[query]) {
                this.setState({
                    dataSource: this.getDataSource(cachedResultsForQuery),
                    isLoading: false
                })
            } else {
                this.setState({isLoading: true});
            }
            return;
        }

        LOADING[query] = true;
        resultsCache.dataForQuery[query] = null;
        this.setState({
            isLoading: true,
            queryNumber: this.state.queryNumber + 1,
            isLoadingTail: false
        })
        fetch(this._urlForQueryAndPage(query, 1))
            .then((response) => response.json())
            .catch((error) => {
                LOADING[query] = false;
                resultsCache.dataForQuery[query] = undefined;

                this.setState({
                    dataSource: this.getDataSource([]),
                    isLoading: false
                })
            })
            .then((responseData) => {
                LOADING[query] = false;
                resultsCache.totalForQuery[query] = responseData.total;
                resultsCache.dataForQuery[query] = responseData.movies;
                resultsCache.nextPageNumberForQuery[query] = 2;

                if (this.state.filter !== query) {
                    return;
                }

                this.setState({
                    isLoadingTail: false,
                    dataSource: this.getDataSource(responseData.movies)
                });
            })
            .done();
    },
    getDataSource: function(movies: Array<any>):ListView.DataSource {
        return this.state.dataSource.cloneWithRows(movies);
    },
    selectMovie: function(movie: Object) {
        //@TODO
    },
    renderRow: function(
        movie: Object,
        sectionID: number | string,
        rowID: number | string,
        highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void
    ) {
      return (
        <MovieCell
            key={movie.id}
            onSelect={() => this.selectMovie(movie)}
            onHighlight={() => highlightRowFunc(sectionID, rowID)}
            onUnhighlight={() => highlightRowFunc(sectionID, rowID)}
            movie={movie}
        />
      )
    },
    render: function() {
        var content = this.state.dataSource.getRowCount() === 0?
            <NoMovies
                filter = {this.state.filter}
                isLoading = {this.state.isLoading}
            />:
            <ListView
                ref="listView"
                dataSource={this.state.dataSource}
                renderRow={this.renderRow}
            />;
        return (
            <View style={styles.container}>
                {content}
            </View>
        )
    }
});

var NoMovies = React.createClass({
    render: function() {
        var text = '';
        if (this.props.filter) {
            text = 'No results for "${this.props.filter}"';
        } else if (!this.props.isLoading) {
            text = "No movies found";
        }

        return (
            <View style={[styles.container, styles.centerText]}>
                <Text style={styles.moMoviesText}>{text}</Text>
            </View>
        )
    }
})

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    centerText: {
        alignItems: 'center'
    },
    noMoviesText: {
        marginTop: 80,
        color: '#888888'
    }
})

export default searchScreen;