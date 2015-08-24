angular.module('merchantApp')
	.directive("imagereader", ['imageSvc',
		function(imageSvc) {
			return {
				require: 'ngModel',
				restrict: 'E',
				scope: {
					ngImageFolder: '='
				},
				template: "<img class='img-polaroid'/><input id='fileInput' type='file' style='display: none;'/>",
				link: function(scope, element, attributes, ngModel) {
					var fileElement = $(angular.element('<input id="fileUpload" type="file" />')),
						imgElement = element.find('img')[0];

					fileElement.on('change', function(changeEvent) {
						var file = changeEvent.target.files[0];
						if(/^image\//i.test(file.type)) {
							imageSvc.uploadImage(changeEvent.target.files[0], {
								'bucketName': 'twyst-outletz',
								'folder_name': scope.ngImageFolder,
								'image_for': 'outlet',
								'image_class': attributes.ngImageClass
							}).then(function(res) {
								ngModel.$setViewValue(res.info.key);
								var reader = new FileReader();
								reader.onload = function(loadEvent) {
									scope.$apply(function() {
										$(imgElement).attr('src', loadEvent.target.result);
									});
									$(imgElement).attr('src', loadEvent.target.result);
								}
								
								reader.readAsDataURL(changeEvent.target.files[0]);	
							}, function(err) {
							});
							
						}
						
					});
					element.bind('click', function() {
						fileElement.trigger('click');
					});
					element.css('cursor', 'pointer');

					// scope.$watch(function() {
					// 	return ngModel.$modelValue;
					// }, function(v) {
					// 	if(v)
					// 		$(imgElement).attr('src', v);
					// });
				}
			}
		}
	]);