angular.module('twystHome').directive('filereader', ['toastr',
	function(toastr) {
		return {
			require: "ngModel",
			restrict: "E",
			template: "<input id='fileInput' type='file'/>",
			link: function(scope, element, attributes, ngModel) {
				var fileElement = $(angular.element('<input id="fileUpload" type="file" />'));
				
				fileElement.on('change', function(changeEvent) {
					
					var file = changeEvent.target.files[0];
					var regex = /^application\//i;
					
					if(regex.test(file.type)) {
						var reader = new FileReader();
						reader.onload = function(loadEvent) {
							console.log(loadEvent.target.result);
						}
						reader.readAsDataURL(changeEvent.target.files[0]);
					}
				});
			}
		}
	}
])