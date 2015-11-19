angular.module('consoleApp')
	.controller('BulCheckinController', ['$scope', 'toastr', 'consoleRESTSvc', '$log',
		'$http', '$timeout', '$window',
		function($scope, toastr, consoleRESTSvc, $log, $http) {

			$scope.fileChanged = function() {
		      var reader = new FileReader();
		      reader.onload = function(e) {
		        $scope.$apply(function() {
		          $scope.jsonData = csvTOJson(reader.result);
		        });
		      };

		      var csvFileInput = document.getElementById('fileInput');
		      var csvFile = csvFileInput.files[0];
		      reader.readAsText(csvFile);
		    }


		    $scope.submitUserList = function(){
		      var csvFileInput = document.getElementById('fileInput');
		      if(csvFileInput.files[0]) {
		      	
		  		for (var i = 0; i < $scope.jsonData.length; i++) {
		  			if($scope.jsonData[i].event_outlet!== '') {
		  				console.log('here')
		  				console.log($scope.jsonData[i])
		  				var event_data = {};
						event_data.event_meta= {};
						event_data.event_meta.phone = $scope.jsonData[i].phone;
						event_data.event_meta.date = new Date();
						event_data.event_meta.event_type = 'bulk_checkin';
						event_data.event_outlet = $scope.jsonData[i].outlet;
						event_data.event_date = $scope.jsonData[i].date;
			  			
			  			consoleRESTSvc.bulkCheckin(event_data)
						.then(function(res) {
							console.log(res);
							toastr.success("Checkin Successful")
						}, function(err) {
							if(err.message) {
								toastr.error(err.message);
							} else {
								toastr.error("Unable to Checkin");
							}
							console.log(err);
						});	
		  			}
		  			
		  					
		  		};
		      }
		      else {
		        alert("Plese Upload a CSV File");
		        return false;
		      }


		    }

		    function csvTOJson(csvFile){

		      var allUsers = csvFile.split("\n");
		      //console.log(allUsers.length+ " allUsers");

		      var result = [];

		      var headers = allUsers[0].split(",");

		      for(var i = 1; i < allUsers.length; i++){

		        var obj = {};
		        var currentUser = allUsers[i].split(",");

		        for(var j = 0; j < headers.length; j++){
		          if(currentUser[j] != undefined){
		            obj[headers[j].trim()] = currentUser[j].trim();
		          }
		        }
		        //console.log(obj);
		        result.push(obj);
		      }
		      return result;
		    }

		    function isMobileNumber(phone) {
		        if(phone
		            && (phone.length === 10)
		            && isNumber(phone)
		            && isValidFirstDigit(phone)) {
		            return true;
		        };
		        return false;
		    }

		    function isValidFirstDigit(phone) {
		        if(phone[0] === '7'
		            || phone[0] === '8'
		            || phone[0] === '9') {
		            return true;
		        }
		        return false;
		    }

		    function isNumber(str) {
		        var numeric = /^-?[0-9]+$/;
		        return numeric.test(str);
		    }



		    function isValidPhone () {
		        if(!$scope.user.phone
		            || isNaN($scope.user.phone)
		            || $scope.user.phone.length !== 10) {

		            return false;
		        }
		        return true;
		    }
		}
	])