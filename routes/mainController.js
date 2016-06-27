
var app = angular.module('books', []);
app.controller('main_control',function($scope,$http){
load_demos();
function load_demos(){
$http.get("http://localhost:3000/thelist").success(function(data){
$scope.loaded=data;
});
}
});
