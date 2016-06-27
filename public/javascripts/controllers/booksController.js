app.controller('booksController',['$scope','$http',
	function($scope,$http) {
		$http.get("http://localhost:3000/thelist/data").success(function( data ) {
			$scope.book=data;
		});
	}]);
