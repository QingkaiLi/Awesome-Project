'use strict';

var React = require('react-native');
var SearchScreen = require('./components/movie/SearchScreen');
var MovieScreen = require('./components/movie/MovieScreen');

var {
    BackAndroid,
    Navigator,
    StyleSheet,
    ToolbarAndroid,
    Text,
    View
} = React;

var RouteMapper = function(route, navigationOperations, onComponentRef) {
    var _navigator = navigationOperations;
    if (route.name === 'search') {
        return (
            <SearchScreen navigator = {navigationOperations}/>
        )
    } else if (route.name === 'movie') {
        return (
            <View style={{flex: 1}}>
                <ToolbarAndroid
                    actions={[]}
                    navIcon={require('image!android_back_white')}
                    onIconClicked={navigationOperations.pop}
                    style={styles.toolbar}
                    titleColor="white"
                    title={route.movie.title}
                    />
                <MovieScreen
                    style={{flex: 1}}
                    navigator={navigationOperations}
                    movie={route.movie}
                />
            </View>
        )
    }
}

var MoviesApp = React.createClass({
     render: function() {
        var initialRoute = {name: 'search'};
        return (
            <Navigator
                style={styles.container}
                initialRoute={initialRoute}
                configureScene={() => Navigator.SceneConfigs.FadeAndroid}
                renderScene={RouteMapper}
            />
        )
    }
})

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  toolbar: {
    backgroundColor: '#a9a9a9',
    height: 56
  },
});

export default MoviesApp;